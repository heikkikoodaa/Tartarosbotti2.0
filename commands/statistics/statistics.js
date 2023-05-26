const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statistics')
    .setDescription('Shows the statistics of the user'),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user
    const member = interaction.guild.members.cache.get(user.id)
    const embed = {
      color: 0x0099ff,
      title: `${user.username}'s statistics`,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        {
          name: 'Joined Discord',
          value: user.createdAt.toDateString(),
          inline: true,
        },
        {
          name: 'Joined Server',
          value: member.joinedAt.toDateString(),
          inline: true,
        },
        {
          name: 'Roles',
          value: member.roles.cache.map((role) => role.toString()).join(' '),
        },
      ],
    }
    await interaction.reply({ embeds: [embed] })
  },
}
