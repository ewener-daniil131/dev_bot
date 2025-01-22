const axios = require("axios");
const callsignPrefix = require("./callsign_prefix.json");
const config = require("../../../config.json");
const { EmbedBuilder } = require('discord.js');
const positions = ["GND", "TWR", "APP", "CTR"];
const onlineCs = [];

class Controller {
    constructor(callsign, controllerName, frequency) {
        this.callsign = callsign;
        this.controllerName = controllerName;
        this.frequency = frequency;
    }
    getCallsign() {
        return this.callsign;
    }
    getControllerName() {
        return this.controllerName;
    }
    getFrequency() {
        return this.frequency;
    }
}
async function atcGet(client) {
    try {
        const guild = client.guilds.cache.get(config.GUILD_ID);
        const channel = guild.channels.cache.get(config.ATC_CHANNEL);
        const online2Cs = [];
        const online2Obj = [];
        const response = await axios.get('https://data.vatsim.net/v3/vatsim-data.json');
        const data = response.data;
        const controllers = data.controllers;

        for (const controller of controllers) {
            const callsign = controller.callsign;
            const controllerName = controller.name;
            const frequency = controller.frequency;

            for (const prefix of callsignPrefix) {
                if (callsign.startsWith(prefix) && positions.includes(callsign.slice(-3))) {
                    const controllerObj = new Controller(callsign, controllerName, frequency);
                    online2Obj.push(controllerObj);
                    online2Cs.push(callsign);
                }
            }
        }

        for (const controller of online2Obj) {
            if (!onlineCs.includes(controller.getCallsign())) {
                // Check if controller is connected on primary frequency before continuing the loop
                if (controller.getFrequency() === "199.998") {
                    continue;
                } else {
                    // Controller Online
                    onlineCs.push(controller.getCallsign());
                    const onlineEmbed = new EmbedBuilder()
                        .setTitle('ATC Announcement')
                        .setDescription('New ATC just logged in!')
                        .setColor(0x00ff4c)
                        .addFields({name: ':green_square: Callsign', value: `\`${controller.getCallsign()}\``})
                        .addFields({name: ':green_square: Controller', value: `\`${controller.getControllerName()}\``})
                        .addFields({name: ':green_square: Frequency', value: `\`${controller.getFrequency()}\``})
                        .setTimestamp()

                    if (channel) {
                        channel.send({embeds: [onlineEmbed]});
                    }
                }
            }
        }

        for (const callsign of onlineCs) {
            if (!online2Cs.includes(callsign)) {
                const index = onlineCs.indexOf(callsign);
                if (index !== -1) {
                    onlineCs.splice(index, 1);
                }

                const offlineEmbed = new EmbedBuilder()
                    .setTitle('ATC Announcement')
                    .setDescription(`:red_square: \`ATC Logged off!\` :red_square:`)
                    .setColor(0xff0000)
                    .addFields({name: 'Callsign', value: callsign})
                    .setTimestamp();

                if (channel) {
                    channel.send({embeds: [offlineEmbed]});
                }
            }

        }
    }catch (error) {
        console.error("An error occurred in atcGet:", error);
    }

}
module.exports = {
    atcGet
};
