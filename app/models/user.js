const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  streamAmount: {
    type: Number,
    default: 0,
  },
  twitchUrl: {
    type: String,
    default: '',
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
