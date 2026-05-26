const prisma = require('../lib/prisma')

// POST /api/projects — create project (client)
exports.createProject = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { title, description, budget, skills, deadline, projectType } = req.body

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseInt(budget),
        skills: skills || [],
        deadline: new Date(deadline),
        projectType: projectType || 'FIXED',
        clientId: user.id,
      },
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/projects — browse all open projects
exports.getAllProjects = async (req, res) => {
  try {
    const { search, skill, minBudget, maxBudget, type } = req.query

    const where = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (skill) {
      where.skills = { has: skill }
    }

    if (minBudget || maxBudget) {
      where.budget = {}
      if (minBudget) where.budget.gte = parseInt(minBudget)
      if (maxBudget) where.budget.lte = parseInt(maxBudget)
    }

    if (type) {
      where.projectType = type
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { name: true, image: true } },
        proposals: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/projects/:id — single project detail
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, image: true, email: true } },
        proposals: {
          include: {
            freelancer: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) return res.status(404).json({ error: 'Project not found' })

    res.status(200).json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    const { id } = req.params

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.clientId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    await prisma.proposal.deleteMany({ where: { projectId: id } })
    await prisma.project.delete({ where: { id } })

    res.status(200).json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}