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

    const activeProjects = user.projects.length
    const proposalsSent = user.proposals.length
    const portfolioItems = user.portfolios.length

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
        profileViews: 0,
      },
      recentProposals,
      recentProjects,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        hourlyRate: true,
        availability: true,
        skills: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PATCH /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const { bio, hourlyRate, availability, skills } = req.body

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ? parseInt(hourlyRate) : null }),
        ...(availability !== undefined && { availability }),
        ...(skills !== undefined && { skills }),
      },
      select: {
        id: true,
        bio: true,
        hourlyRate: true,
        availability: true,
        skills: true,
      },
    })

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}