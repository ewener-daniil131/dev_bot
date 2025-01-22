const {NewsChannel, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-news')
        .setDescription('Создает событие')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option
            .setName("news_channel")
            .setDescription("Канал для новостей")
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName('title_news')
            .setDescription('заголовок новости')
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName('text_news')
            .setDescription('текст новости')
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName('color_news')
            .setDescription('цвет новости')
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName('image_news')
            .setDescription('картинка новости')
            .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const {options} = interaction;
            const news_channel = options.getChannel("news_channel");
            const news_message = options.getString("text_news");
            const news_title = options.getString("title_news");
            const news_color = options.getString("color_news");
            const news_img = options.getString("image_news");
            const newsEmbed = new EmbedBuilder()
                .setTitle(news_title)
                .setDescription(news_message)
                .setColor(news_color)
                .setImage(news_img)
                .setTimestamp();

            news_channel.send({content: '@everyone', embeds: [newsEmbed]});

            interaction.reply({content: "Новость создана", ephemeral: true});

        }catch (error) {
            interaction.reply({content: "Где-то ошибка!!!!!", ephemeral: true});
            console.error("Error while setting up welcome:", error);
        }
    }

}