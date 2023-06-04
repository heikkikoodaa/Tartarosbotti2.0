require('dotenv').config()

// Get the bot related constants from the .env file
const BOT_TOKEN = process.env.BOT_TOKEN
const BOT_ID = process.env.BOT_ID
const GUILD_ID = process.env.GUILD_ID
const STREAM_NOTIFICATION_CHANNEL = process.env.STREAM_NOTIFICATION_CHANNEL

// Get the MongoDB URL from the .env file
const MONGO_URL = process.env.MONGO_URL

// Get the backend URL from the .env file
const BACKEND_URL = process.env.BACKEND_URL

// Export the bot token
module.exports = {
  BOT_TOKEN,
  MONGO_URL,
  BACKEND_URL,
  BOT_ID,
  GUILD_ID,
  STREAM_NOTIFICATION_CHANNEL,
}
