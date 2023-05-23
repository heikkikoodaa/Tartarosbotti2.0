const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
  username: String,
  twitchUrl: String,
  isStreaming: {
    type: Boolean,
    default: false,
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
