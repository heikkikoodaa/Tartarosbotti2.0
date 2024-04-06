const ENVIRONMENT = process.env.ENVIRONMENT.toLowerCase()
const isProductionEnvironment = ENVIRONMENT === 'production' ? true : false

// Get the bot related constants from the .env file
const BOT_TOKEN = isProductionEnvironment
  ? process.env.BOT_TOKEN_PROD
  : process.env.BOT_TOKEN_DEV
const BOT_ID = isProductionEnvironment
  ? process.env.BOT_ID_PROD
  : process.env.BOT_ID_DEV
const GUILD_ID = isProductionEnvironment
  ? process.env.GUILD_ID_PROD
  : process.env.GUILD_ID_DEV

// Encryption pass and salt
const ENCRYPT_PASS = process.env.ENCRYPT_PASS
const ENCRYPT_SALT = process.env.SALT

// Guild specific constants and variables
const STREAM_NOTIFICATION_CHANNEL = isProductionEnvironment
  ? process.env.STREAM_NOTIFICATION_CHANNEL_PROD
  : process.env.STREAM_NOTIFICATION_CHANNEL_DEV

// Get the MongoDB URL from the .env file
const MONGO_URL = isProductionEnvironment
  ? process.env.MONGO_URL_PROD
  : process.env.MONGO_URL_DEV

// Get the backend URL from the .env file
const BACKEND_URL = process.env.BACKEND_URL

// Get Twitch client ID and client secret
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

const TOKEN_SECRET = process.env.TOKEN_SECRET
const TARTAROS_NOTIFICATIONS = isProductionEnvironment
  ? process.env.TARTAROS_NOTIFICATIONS
  : undefined

// Export the bot token
module.exports = {
  BACKEND_URL,
  BOT_ID,
  BOT_TOKEN,
  GUILD_ID,
  ENCRYPT_SALT,
  ENCRYPT_PASS,
  MONGO_URL,
  STREAM_NOTIFICATION_CHANNEL,
  TARTAROS_NOTIFICATIONS,
  TOKEN_SECRET,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  isProductionEnvironment,
}
