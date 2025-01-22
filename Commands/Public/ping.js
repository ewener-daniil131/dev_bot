const {SlashCommandBuilder, CommandInteraction, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("pong")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessage),
    execute(interaction) {
        interaction.reply({content: "Pong", ephemeral: true})
    },
};