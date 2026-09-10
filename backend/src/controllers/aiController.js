const prisma = require('../lib/prisma')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const cleanJSON = (raw) =>
  raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json|```/g, '').trim()

// POST /api/ai/evaluate-proposals
exports.evaluateProposals = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { projectId } = req.body
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposals: {
          include: {
            freelancer: {
              select: { name: true, bio: true },
            },
          },
        },
      },
    })

    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.clientId !== user.id) return res.status(403).json({ error: 'Forbidden' })
    if (project.proposals.length === 0) return res.status(400).json({ error: 'No proposals to evaluate' })

    const proposalList = project.proposals.map((p, i) => `
Proposal ${i + 1}:
- ID: ${p.id}
- Freelancer: ${p.freelancer.name}
- Bid: $${p.bidAmount}
- Timeline: ${p.timeline}
- Bio: ${p.freelancer.bio || 'Not provided'}
- Cover Letter: ${p.coverLetter}
`).join('\n')

    const prompt = `You are an expert hiring assistant. Evaluate these freelancer proposals for the following project and rank them.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

PROPOSALS:
${proposalList}

Return ONLY a valid JSON array (no markdown, no explanation, no thinking) in this exact format:
[
  {
    "proposalId": "<exact proposal id>",
    "freelancerName": "<name>",
    "rank": 1,
    "score": 85,
    "verdict": "Top pick",
    "reasons": ["Strong relevant skills", "Competitive bid", "Clear cover letter"],
    "concern": "Timeline is slightly optimistic"
  }
]

Score out of 100. Rank from best (1) to worst. Keep reasons to 3 bullet points max. concern can be empty string if none.`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const results = JSON.parse(cleanJSON(raw))

    res.status(200).json({ results })
  } catch (error) {
    console.error('AI evaluate error:', error)
    res.status(500).json({ error: error.message })
  }
}

// POST /api/ai/match-freelancers
exports.matchFreelancers = async (req, res) => {
  try {
    const { projectId } = req.body
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const freelancers = await prisma.user.findMany({
      where: {
        role: { in: ['FREELANCER', 'BOTH'] },
        id: { not: project.clientId },
      },
      select: {
        id: true,
        name: true,
        bio: true,
        portfolios: { select: { title: true, techStack: true } },
      },
      take: 30,
    })

    if (freelancers.length === 0) return res.status(200).json({ results: [] })

    const freelancerList = freelancers.map((f, i) => `
Freelancer ${i + 1}:
- ID: ${f.id}
- Name: ${f.name}
- Bio: ${f.bio || 'Not provided'}
- Portfolio: ${f.portfolios.map(p => p.title).join(', ') || 'None'}
- Portfolio Tech: ${f.portfolios.flatMap(p => p.techStack).join(', ') || 'None'}
`).join('\n')

    const prompt = `You are a freelancer matching expert. Match the top 5 freelancers for this project.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

FREELANCERS:
${freelancerList}

Return ONLY a valid JSON array (no markdown, no explanation, no thinking) of the top 5 matches:
[
  {
    "freelancerId": "<exact id>",
    "freelancerName": "<name>",
    "matchScore": 92,
    "matchReasons": ["Has React and Node.js", "Portfolio matches scope"],
    "fitSummary": "Strong full-stack developer with direct experience in this type of project."
  }
]

matchScore out of 100. Return exactly 5 (or fewer if less than 5 freelancers exist). No extra text.`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const results = JSON.parse(cleanJSON(raw))

    res.status(200).json({ results })
  } catch (error) {
    console.error('AI match error:', error)
    res.status(500).json({ error: error.message })
  }
}

// POST /api/ai/review-portfolio
exports.reviewPortfolio = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { portfolios: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.portfolios.length === 0) return res.status(400).json({ error: 'No portfolio items to review' })

    const portfolioList = user.portfolios.map((p, i) => `
Item ${i + 1}: ${p.title}
Description: ${p.description}
Tech Stack: ${p.techStack.join(', ') || 'Not listed'}
Has Live URL: ${p.liveUrl ? 'Yes' : 'No'}
Has GitHub: ${p.githubUrl ? 'Yes' : 'No'}
`).join('\n')

    const prompt = `You are a senior hiring manager reviewing a freelancer's portfolio. Give constructive, specific feedback.

FREELANCER: ${user.name}
BIO: ${user.bio || 'Not provided'}

PORTFOLIO:
${portfolioList}

Return ONLY valid JSON (no markdown, no explanation, no thinking):
{
  "overallScore": 72,
  "overallVerdict": "Good foundation, needs polish",
  "strengths": ["Clear project descriptions", "Diverse tech stack"],
  "improvements": [
    { "issue": "Missing live links on 3 projects", "fix": "Deploy projects to Vercel or Netlify and add live URLs" },
    { "issue": "Descriptions are too short", "fix": "Add measurable outcomes like reduced load time by 40 percent" }
  ],
  "missingItems": ["Client testimonials", "Case study depth"],
  "tip": "Add 1-2 case studies with problem, solution, and result format to stand out."
}`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const result = JSON.parse(cleanJSON(raw))

    res.status(200).json(result)
  } catch (error) {
    console.error('AI review error:', error)
    res.status(500).json({ error: error.message })
  }
}