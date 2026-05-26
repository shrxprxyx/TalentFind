const express = require('express')
const router = express.Router()
const {
  createProposal,
  getMyProposals,
  deleteProposal,
} = require('../controllers/proposalController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/my', authMiddleware, getMyProposals)
router.post('/', authMiddleware, createProposal)
router.delete('/:id', authMiddleware, deleteProposal)

module.exports = router