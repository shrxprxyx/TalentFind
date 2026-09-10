const express = require('express')
const router = express.Router()
const { evaluateProposals, matchFreelancers, reviewPortfolio } = require('../controllers/aiController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/evaluate-proposals', authMiddleware, evaluateProposals)
router.post('/match-freelancers', authMiddleware, matchFreelancers)
router.post('/review-portfolio', authMiddleware, reviewPortfolio)

module.exports = router