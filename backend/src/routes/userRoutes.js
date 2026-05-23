const express = require('express')
const router = express.Router()

const {
    createUser,
    getCurrentUser,
} = require('../controllers/userController')

const authMiddleware = require('../middleware/authMiddleware')

router.post('/create', createUser)

router.get('/me', authMiddleware, getCurrentUser)

module.exports = router