const { Client } = require('discord.js');
const config = require("../../config.json");
let reconnecting = false;

module.exports = {
    name: "disconnect",
    once: true,
    async execute(client) {
        console.log('Disconnected from Discord. Attempting to reconnect...');
        if (reconnecting) return;
        reconnecting = true;

        try {
            await client.login(config.token); // Попытка переподключения
        } catch (error) {
            console.error('Reconnection failed:', error);

            setTimeout(this.execute, 60000);
        }
    },
};