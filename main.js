const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv').config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const BOT_TOKEN = process.env.BOT_TOKEN

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(BOT_TOKEN)
