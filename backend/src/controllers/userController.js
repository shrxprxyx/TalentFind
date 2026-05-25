const prisma = require('../lib/prisma')

exports.createUser = async (req, res) => {
  try {
    const { clerkId, email, name, image } = req.body

    const existingUser = await prisma.user.findUnique({ where: { clerkId } })
    if (existingUser) return res.status(200).json(existingUser)

    const user = await prisma.user.create({
      data: { clerkId, email, name, image },
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateRole = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const { role } = req.body

    if (!['FREELANCER', 'CLIENT', 'BOTH'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: { role },
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const clerkId = req.auth.sub

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        projects: {
          include: { proposals: true },
        },
        proposals: true,
        portfolios: true,
      },
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Active projects (posted by this user as client)
    const activeProjects = user.projects.length

    // Proposals sent (as freelancer)
    const proposalsSent = user.proposals.length

    // Portfolio items count
    const portfolioItems = user.portfolios.length

    // Recent proposals on user's projects (as client)
    const recentProposals = await prisma.proposal.findMany({
      where: {
        project: { clientId: user.id },
      },
      include: {
        freelancer: { select: { name: true, image: true, email: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Recent projects
    const recentProjects = await prisma.project.findMany({
      where: { clientId: user.id },
      include: { proposals: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bio: user.bio,
      },
      stats: {
        activeProjects,
        proposalsSent,
        portfolioItems,
        profileViews: 0, // placeholder — can add view tracking later
      },
      recentProposals,
      recentProjects,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}