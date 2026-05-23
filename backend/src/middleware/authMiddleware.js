const { verifyToken } = require('@clerk/backend')

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization

        if (!token) {
            return res.status(401).json({
                message: 'No token provided',
            })
        }

        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        })

        req.auth = payload

        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized',
        })
    }
}

module.exports = authMiddleware