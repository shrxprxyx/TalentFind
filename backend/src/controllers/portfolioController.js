const prisma = require('../lib/prisma')

// GET /api/portfolio/my — get current user's portfolio
exports.getMyPortfolio = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json(portfolios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/portfolio — add portfolio item
exports.createPortfolio = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { title, description, image, githubUrl, liveUrl, techStack } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        description,
        image: image || null,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        techStack: techStack || [],
        userId: user.id,
      },
    })

    res.status(201).json(portfolio)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PATCH /api/portfolio/:id
exports.updatePortfolio = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    const { id } = req.params

    const item = await prisma.portfolio.findUnique({ where: { id } })
    if (!item) return res.status(404).json({ error: 'Portfolio item not found' })
    if (item.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const { title, description, image, githubUrl, liveUrl, techStack } = req.body

    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(techStack !== undefined && { techStack }),
      },
    })

    res.status(200).json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/portfolio/:id
exports.deletePortfolio = async (req, res) => {
  try {
    const clerkId = req.auth.sub
    const user = await prisma.user.findUnique({ where: { clerkId } })
    const { id } = req.params

    const item = await prisma.portfolio.findUnique({ where: { id } })
    if (!item) return res.status(404).json({ error: 'Portfolio item not found' })
    if (item.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    await prisma.portfolio.delete({ where: { id } })
    res.status(200).json({ message: 'Portfolio item deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}