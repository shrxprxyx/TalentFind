const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('send_message', (data) => {
    io.emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

app.get('/', (req, res) => {
  res.send('TalentStage Backend Running')
})

// Routes
const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const proposalRoutes = require('./routes/proposalRoutes')
const portfolioRoutes = require('./routes/portfolioRoutes')

app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/portfolio', portfolioRoutes)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})