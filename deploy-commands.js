const { REST, Routes } = require('discord.js')
const { BOT_ID, BOT_TOKEN, GUILD_ID } = require('./configs/constants')
const fs = require('node:fs')
const path = require('node:path')

const commands = []
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      commands.push(command.data)
    } else {
      console.log(`Error in ${filePath}`)
    }
  }
}

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN)

const deployCommands = async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    // Clear all commands
    await rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
      body: [],
    })

    // Set all commands
    await rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
      body: commands,
    })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

deployCommands()
