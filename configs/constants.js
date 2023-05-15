require('dotenv').config()

// Get the bot token from the .env file
const BOT_TOKEN = process.env.BOT_TOKEN
const MONGO_URL = process.env.MONGO_URL

// Export the bot token
module.exports = {
  BOT_TOKEN,
  MONGO_URL,
}
