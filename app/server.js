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

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err))

module.exports = {
  startApp: () => {
    app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))
  },
}
