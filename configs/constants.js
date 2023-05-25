require('dotenv').config()

// Get the bot token from the .env file
const BOT_TOKEN = process.env.BOT_TOKEN

// Get the MongoDB URL from the .env file
const MONGO_URL = process.env.MONGO_URL

// Get the backend URL from the .env file
const BACKEND_URL = process.env.BACKEND_URL

// Export the bot token
module.exports = {
  BOT_TOKEN,
  MONGO_URL,
  BACKEND_URL,
}
