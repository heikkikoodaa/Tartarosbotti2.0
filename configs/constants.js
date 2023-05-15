require('dotenv').config()

// Get the bot token from the .env file
const BOT_TOKEN = process.env.BOT_TOKEN

// Export the bot token
module.exports = {
  BOT_TOKEN,
}
