const prisma = require('../lib/prisma')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Extracts the first JSON array or object found in the string
const extractJSON = (raw) => {
  // Strip think tags first
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  // Try to find JSON array
  const arrMatch = cleaned.match(/\[[\s\S]*\]/)
  if (arrMatch) return arrMatch[0]
  // Try to find JSON object
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

    const prompt = `You are an expert hiring assistant. Evaluate these freelancer proposals and rank them.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

PROPOSALS:
${proposalList}

Respond with ONLY a raw JSON array, no preamble, no thinking, no markdown:
[{"proposalId":"<id>","freelancerName":"<name>","rank":1,"score":85,"verdict":"Top pick","reasons":["reason1","reason2","reason3"],"concern":"any concern or empty string"}]`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
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
- Portfolio: ${f.portfolios.map(p => p.title).join(', ') || 'None'}
- Tech: ${f.portfolios.flatMap(p => p.techStack).join(', ') || 'None'}
`).join('\n')

    const prompt = `You are a freelancer matching expert. Find the top 5 matches for this project.

PROJECT:
Title: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Required Skills: ${project.skills.join(', ')}

FREELANCERS:
${freelancerList}

Respond with ONLY a raw JSON array, no preamble, no thinking, no markdown:
[{"freelancerId":"<id>","freelancerName":"<name>","matchScore":92,"matchReasons":["reason1","reason2"],"fitSummary":"one sentence summary"}]`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
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

    const prompt = `You are a senior hiring manager reviewing a freelancer portfolio. Give specific feedback.

FREELANCER: ${user.name}
BIO: ${user.bio || 'Not provided'}

PORTFOLIO:
${portfolioList}

Respond with ONLY a raw JSON object, no preamble, no thinking, no markdown:
{"overallScore":72,"overallVerdict":"Good foundation, needs polish","strengths":["strength1","strength2"],"improvements":[{"issue":"issue description","fix":"how to fix it"}],"missingItems":["item1","item2"],"tip":"one actionable tip"}`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
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