const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  avatar: String,
  discordId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  streamAmount: [Object],
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
