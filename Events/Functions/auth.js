const config = require("../../config.json");
const targetDigits = [6, 7]; // Общее количество цифр в нике

async function checkUserNicknames(client) {
  try {
    const guild = client.guilds.cache.get(config.GUILD_ID); // Замените на ID вашего сервера
    if (!guild) return;

    const members = await guild.members.fetch();
    for (const member of members.values()) {
      if (member.user.bot) continue;
      const nickname = member.nickname;
      if (nickname) {
        const digitCount = nickname
          .split("")
          .filter((char) => !isNaN(parseInt(char, 10))).length;
        if (targetDigits.includes(digitCount)) {
          await member.roles.remove([config.NON_VERIFY_ROLE]);
          await member.roles.add([config.VERIFY_ROLE]);
        } else {
          await member.roles.add([config.NON_VERIFY_ROLE]);
        }
      } else {
        await member.roles.set([config.NON_VERIFY_ROLE]);
      }
    }
  } catch (error) {
    console.error("An error occurred while checking user nicknames:", error);
  }
}

module.exports = {
  checkUserNicknames,
};
