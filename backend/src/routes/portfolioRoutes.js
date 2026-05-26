const express = require('express')
const router = express.Router()
const {
  getMyPortfolio,
  createPortfolio,
  deletePortfolio,
  updatePortfolio,
} = require('../controllers/portfolioController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/my', authMiddleware, getMyPortfolio)
router.post('/', authMiddleware, createPortfolio)
router.patch('/:id', authMiddleware, updatePortfolio)
router.delete('/:id', authMiddleware, deletePortfolio)

module.exports = router