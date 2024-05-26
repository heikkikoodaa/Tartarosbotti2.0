const mongoose = require('mongoose')
const { Schema } = mongoose

const videoSchema = new Schema({
  videoId: { type: String, required: true },
})

const Token = mongoose.model('Video', videoSchema)

module.exports = Token
