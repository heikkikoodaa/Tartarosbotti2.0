const mongoose = require('mongoose')
const { Schema } = mongoose

const tokenSchema = new Schema({
  iv: String,
  encryptedToken: String,
  expiresAt: Date,
})

const Token = mongoose.model('Token', tokenSchema)

module.exports = Token
