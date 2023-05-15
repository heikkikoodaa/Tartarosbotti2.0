const express = require('express')
const mongoose = require('mongoose')
const { MONGO_URL } = require('./configs/constants')

const app = express()

const PORT = process.env.PORT || 3000

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
