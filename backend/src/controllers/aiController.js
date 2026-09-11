const prisma = require('../lib/prisma')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const extractJSON = (raw) => {
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const arrMatch = cleaned.match(/\[[\s\S]*\]/)
  if (arrMatch) return arrMatch[0]
  const objMatch = cleaned.match(/\{[\s\S]*\}/)
  if (objMatch) return objMatch[0]
  return cleaned
}

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
            freelancer: { select: { name: true, bio: true } },
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

    const prompt = `You are an expert hiring assistant. Evaluate these freelancer proposals for the project below and rank them from best to worst.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

PROPOSALS:
${proposalList}

Return a JSON array where each element has these fields:
- proposalId: string (the exact proposal ID from above)
- freelancerName: string
- rank: integer starting from 1 (1 = best)
- score: integer from 0 to 100
- verdict: short string like "Top pick" or "Strong candidate"
- reasons: array of up to 3 short strings explaining why
- concern: string with one concern, or empty string if none

Output only the JSON array, nothing else.`

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 900,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const results = JSON.parse(extractJSON(raw))

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
- Portfolio projects: ${f.portfolios.map(p => p.title).join(', ') || 'None'}
- Tech used: ${f.portfolios.flatMap(p => p.techStack).join(', ') || 'None'}
`).join('\n')

    const prompt = `You are a freelancer matching expert. Find the best freelancers for this project.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

FREELANCERS:
${freelancerList}

Return a JSON array of the top 5 matches (or fewer if less than 5 exist). Each element must have:
- freelancerId: string (exact ID from above)
- freelancerName: string
- matchScore: integer from 0 to 100
- matchReasons: array of 2 short strings explaining the match
- fitSummary: one sentence describing why they are a good fit

Output only the JSON array, nothing else.`

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 900,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const results = JSON.parse(extractJSON(raw))

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

    const prompt = `You are a senior hiring manager reviewing a freelancer portfolio. Give constructive feedback.

FREELANCER: ${user.name}
BIO: ${user.bio || 'Not provided'}

PORTFOLIO:
${portfolioList}

Return a JSON object with these fields:
- overallScore: integer from 0 to 100
- overallVerdict: short string summary
- strengths: array of 2 strings describing what is good
- improvements: array of objects, each with "issue" (string) and "fix" (string)
- missingItems: array of strings describing what is missing
- tip: one actionable string tip

Output only the JSON object, nothing else.`

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 900,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const result = JSON.parse(extractJSON(raw))

    res.status(200).json(result)
  } catch (error) {
    console.error('AI review error:', error)
    res.status(500).json({ error: error.message })
  }
}