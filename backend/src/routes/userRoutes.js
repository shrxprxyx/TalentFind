const express = require('express')
const router = express.Router()
const {
  createUser,
  getCurrentUser,
  updateRole,
  getDashboardStats,
  getProfile,
  updateProfile,
} = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/create', createUser)
router.get('/me', authMiddleware, getCurrentUser)
router.patch('/role', authMiddleware, updateRole)
router.get('/dashboard-stats', authMiddleware, getDashboardStats)
router.get('/profile', authMiddleware, getProfile)
router.patch('/profile', authMiddleware, updateProfile)

module.exports = router