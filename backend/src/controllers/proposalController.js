const prisma = require('../lib/prisma')

// POST /api/proposals — submit proposal on a project
exports.createProposal = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { projectId, bidAmount, timeline, coverLetter } = req.body

    if (!projectId || !bidAmount || !timeline || !coverLetter) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    // Prevent client from proposing on own project
    if (project.clientId === user.id) {
      return res.status(400).json({ error: 'Cannot propose on your own project' })
    }

    // Prevent duplicate proposals
    const existing = await prisma.proposal.findFirst({
      where: { projectId, freelancerId: user.id },
    })
    if (existing) {
      return res.status(400).json({ error: 'You already submitted a proposal for this project' })
    }

    const proposal = await prisma.proposal.create({
      data: {
        bidAmount: parseInt(bidAmount),
        timeline,
        coverLetter,
        projectId,
        freelancerId: user.id,
      },
      include: {
        project: { select: { title: true } },
      },
    })

    res.status(201).json(proposal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/proposals/my — all proposals sent by current user
exports.getMyProposals = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const proposals = await prisma.proposal.findMany({
      where: { freelancerId: user.id },
      include: {
        project: {
          include: {
            client: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json(proposals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/proposals/:id — withdraw proposal
exports.deleteProposal = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' })
    if (proposal.freelancerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    await prisma.proposal.delete({ where: { id } })
    res.status(200).json({ message: 'Proposal withdrawn' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}