const express = require('express')
const router = express.Router()
const {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
} = require('../controllers/projectController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', getAllProjects)                       // public browse
router.get('/:id', getProjectById)                   // public single
router.post('/', authMiddleware, createProject)      // auth required
router.delete('/:id', authMiddleware, deleteProject) // auth required

module.exports = router