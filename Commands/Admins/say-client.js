const {SlashCommandBuilder, CommandInteraction, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription("Написать сообщени в чат от имени бота.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option
            .setName("say_channel")
            .setDescription("Канал для сообщения")
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName("say_msg")
            .setDescription("Сообщение")
            .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const {options} = interaction;
            const say_channel = options.getChannel("say_channel");
            const say_message = options.getString("say_msg");
            say_channel.send(say_message);
            interaction.reply({content: "ok", ephemeral: true});

        }catch (error) {
            interaction.reply({content: "Где-то ошибка!!!!!", ephemeral: true});
            console.error("Error while setting up welcome:", error);
        }
    }

}