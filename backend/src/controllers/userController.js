const prisma = require('../lib/prisma')

exports.createUser = async (req, res) => {
    try {
        const { clerkId, email, name, image } = req.body
        
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId,
            },
        })

        if (existingUser) {
            return res.status(200).json(existingUser)
        }

        const user = await prisma.user.create({
            data: {
                clerkId,
                email,
                name,
                image,
            },
        })

        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message,
        })
    }
}

exports.getCurrentUser = async (req, res) => {
    try {
        const clerkId = req.auth.sub

        const user = await prisma.user.findUnique({
            where: {
                clerkId,
            },
        })

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({
            error: error.message,
        })
    }
}