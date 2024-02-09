require('dotenv').config()

const ENVIRONMENT = process.env.ENVIRONMENT.toLowerCase()
const isProductionEnvironment = ENVIRONMENT === 'production' ? true : false

// Get the bot related constants from the .env file
const BOT_TOKEN = isProductionEnvironment ? process.env.BOT_TOKEN_PROD : process.env.BOT_TOKEN_DEV
const BOT_ID = isProductionEnvironment ? process.env.BOT_ID_PROD : process.env.BOT_ID_DEV
const GUILD_ID = isProductionEnvironment ? process.env.GUILD_ID_PROD : process.env.GUILD_ID_DEV

// Guild specific constants and variables
const STREAM_NOTIFICATION_CHANNEL = isProductionEnvironment ?
  process.env.STREAM_NOTIFICATION_CHANNEL_PROD : process.env.STREAM_NOTIFICATION_CHANNEL_DEV

// Get the MongoDB URL from the .env file
const MONGO_URL = isProductionEnvironment ? process.env.MONGO_URL_PROD : process.env.MONGO_URL_DEV

// Get the backend URL from the .env file
const BACKEND_URL = process.env.BACKEND_URL

// Export the bot token
module.exports = {
  BACKEND_URL,
  BOT_ID,
  BOT_TOKEN,
  GUILD_ID,
  MONGO_URL,
  STREAM_NOTIFICATION_CHANNEL,
}
