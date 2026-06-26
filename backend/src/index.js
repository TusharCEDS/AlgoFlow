const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./db/index')
const authRoutes = require('./routes/auth')
const problemRoutes = require('./routes/problems')
const authMiddleware = require('./middleware/auth')
const submissionRoutes = require('./routes/submissions')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/problems', problemRoutes)

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, you are authenticated` })
})
app.use('/api/submissions', submissionRoutes)
app.get('/', (req, res) => {
  res.json({ message: 'AlgoFlow backend is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})