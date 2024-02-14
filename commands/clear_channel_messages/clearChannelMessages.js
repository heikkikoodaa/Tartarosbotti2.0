const { SlashCommandBuilder } = require('@discordjs/builders')

// eslint-disable-next-line no-unused-vars
const permissions = (1 << 5).toString()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-channel-messages')
    .setDescription('Clears all of the channel messages')
    .setDefaultMemberPermissions(0)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to clear the messages from')
        .setRequired(true),
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel')
    const messages = await channel.messages.fetch()
    // Delete all messages
    await channel.bulkDelete(messages)
    await interaction.reply({
      content: `Kanavan - **${channel.name}** viestit tyhjennettiin onnistuneesti!`,
    })
  },
}
