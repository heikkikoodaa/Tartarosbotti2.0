const express = require('express')
const mongoose = require('mongoose')
const { MONGO_URL } = require('../configs/constants')
const users = require('./routes/users')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use('/users', users)
app.use(express.json())
app.use(cors())

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err))

module.exports = {
  startApp: () => {
    app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
  },
}
