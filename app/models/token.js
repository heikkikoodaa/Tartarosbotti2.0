const mongoose = require('mongoose')
const { Schema } = mongoose

const tokenSchema = new Schema({
  name: { type: String, unique: true, required: true },
  token: { type: String, required: true },
  iv: String,
  expiresAt: Date,
})

const Token = mongoose.model('Token', tokenSchema)

module.exports = Token
