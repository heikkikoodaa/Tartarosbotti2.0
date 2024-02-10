const express = require('express')
const mongoose = require('mongoose')
const { MONGO_URL } = require('../configs/constants')
const users = require('./routes/users')
const token = require('./routes/token')
const cors = require('cors')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())

// Routes
app.use('/users', users)
app.use('/token', token)

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to DB')
  } catch (error) {
    console.log(`[ERROR]: ${error.message}`)
  }
}

connectToDB()

const startApp = () => {
  const server = app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))

  const handleExit = (signal) => {
    console.log(`Received ${signal}. Closing server gracefully.`)

    server.close(() => {
      console.log('Server is now closed')
      process.exit(0)
    })
  }

  process.on('SIGINT', handleExit)
  process.on('SIGQUIT', handleExit)
  process.on('SIGTERM', handleExit)

  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception]: ${err.stack || err}`)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`[Unhandled Rejection]: At: ${promise}, reason: ${reason}`)
  })
}

module.exports = {
  startApp,
}
