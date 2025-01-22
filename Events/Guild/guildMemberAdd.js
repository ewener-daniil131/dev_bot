const { GuildMember, EmbedBuilder, Interaction } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: "guildMemberAdd",
    async execute(member, client) {
        try {

            const guild = member.guild; // Получаем объект сервера
            if (guild.id !== config.GUILD_ID) {
                // Если новый участник присоединился не на том сервере, который нас интересует, ничего не делаем
                return;
            }
            const RoleId = guild.roles.cache.get(config.NON_VERIFY_ROLE);
            const welcomeChannel = guild.channels.cache.get(config.WELCOME_CHANNEL);

            const welcomeEmbed = new EmbedBuilder()
                .setTitle("**Новый участник!**")
                .setDescription(`У нас появился ${member.user}`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor(0x037821)
                .addFields({ name: "Количество участников", value: `${guild.memberCount}` })
                .setTimestamp();

            welcomeChannel.send({ embeds: [welcomeEmbed] });
            member.roles.add(RoleId);
        } catch (error) {
            console.error("Error while setting up welcome:", error);
            // Handle the error if necessary
        }
    }
}