const axios = require("axios");
const {EmbedBuilder} = require("discord.js");
const positions = ["GND", "TWR", "APP", "CTR"];
const callsignPrefix = require("./callsign_prefix.json");
const config = require("../../../config.json");
const bookedCs = [];
let activeBookingsMessageId = config.ACTIVE_ATC_BOOKING_MESSAGE;


class Client_booking {
    constructor(callsign, cid, bookingsStart, bookingsEnd) {
        this.callsign = callsign;
        this.cid = cid;
        this.bookingsStart = bookingsStart;
        this.bookingsEnd = bookingsEnd;
    }

    getCallsign() {
        return this.callsign;
    }

    getCid() {
        return this.cid;
    }

    getBookingsStart() {
        return this.bookingsStart;
    }

    getBookingsEnd() {
        return this.bookingsEnd;
    }
}

async function atcBooking(client) {
    try {
        const guild = client.guilds.cache.get(config.GUILD_ID);
        const channel = guild.channels.cache.get(config.BOOKING_CHANNEL);
        const booked2Cs = [];
        const booked2Obj = [];
        const response = await axios.get('https://atc-bookings.vatsim.net/api/booking');
        const data = response.data;

        for (const atc of data) {
            if (atc.type !== 'booking') continue;

            const callsign = atc.callsign;
            const timeStart = atc.start;
            const timeEnd = atc.end;
            const cid = atc.cid;


            const bookingsStartTime = formatBookingTime(timeStart);
            const bookingsEndTime = formatBookingTime(timeEnd);

            for (const prefix of callsignPrefix) {
                if (callsign.startsWith(prefix) && positions.includes(callsign.slice(-3))) {
                    const controllerObj = new Client_booking(callsign, cid, bookingsStartTime, bookingsEndTime);
                    booked2Obj.push(controllerObj);
                    booked2Cs.push(callsign);
                }
            }
        }


        const activeBookingsText = booked2Obj.map(controller => {
            return `${controller.getCallsign().padEnd(12)} | ${String(controller.getCid()).padEnd(10)} | ${controller.getBookingsStart().padEnd(15)} | ${controller.getBookingsEnd()}`;
        }).join('\n');


        

        if (!activeBookingsMessageId) {
            // Создание нового сообщения, если ID отсутствует
            if (channel) {
                const newMessage = await channel.send(`\`\`\`plaintext\nATC Booking\nCallsign        / Controller    / Shift Start (UTC) / Shift End (UTC)\n${activeBookingsText}\n\`\`\``);
                activeBookingsMessageId = newMessage.id;
            }
        } else {
            // Обновление существующего сообщения по его ID
            const existingMessage = await channel.messages.fetch(activeBookingsMessageId);
            if (existingMessage) {
                existingMessage.edit(`\`\`\`plaintext\nATC Booking\nCallsign        / Controller    / Shift Start (UTC) / Shift End (UTC)\n${activeBookingsText}\n\`\`\``);
            }
        }

            for (const controller of booked2Obj) {
            if (!bookedCs.includes(controller.getCallsign())) {
                bookedCs.push(controller.getCallsign());
                const bookEmbed = new EmbedBuilder()
                    .setTitle('Kazakhstan VATSIM booking')
                    .setDescription('New booking!')
                    .setColor(0x00ff4c)
                    .addFields({name: ':radio: Position', value: `\`${controller.getCallsign()}\``})
                    .addFields({name: ':id: CID', value: `\`${controller.getCid()}\``})
                    .addFields({name: ':timer: Start Time', value: `\`${controller.getBookingsStart()}z\``})
                    .addFields({name: ':timer: End Time', value: `\`${controller.getBookingsEnd()}z\``})

                if (channel) {
                    const sentMessage = await channel.send({embeds: [bookEmbed]});

                    // Сохраняем ID отправленного сообщения
                    const messageId = sentMessage.id;
                    // Запускаем таймер для удаления через 12 часов
                    setTimeout(async () => {
                        try {
                            const messageToDelete = await channel.messages.fetch(messageId);
                            if (messageToDelete) {
                                messageToDelete.delete();
                            }
                        } catch (error) {
                            console.error("Error deleting message:", error);
                        }
                    },  12 * 60 * 60 * 1000); // 12 часов в миллисекундах
                }
            }
        }

        for (const callsign of bookedCs) {
            if (!booked2Cs.includes(callsign)) {
                bookedCs.splice(bookedCs.indexOf(callsign), 1);

                const bookRemove = new EmbedBuilder()
                    .setTitle('Kazakhstan VATSIM booking')
                    .setDescription(':x:`ATC Booking was removed!` :x:')
                    .setColor(0xff0000)
                    .addFields({name: ':radio: Callsign', value: callsign});

                if (channel) {
                    const sentMessage = await channel.send({embeds: [bookRemove]});

                    // Сохраняем ID отправленного сообщения
                    const messageId = sentMessage.id;
                    // Запускаем таймер для удаления через 12 часов
                    setTimeout(async () => {
                        try {
                            const messageToDelete = await channel.messages.fetch(messageId);
                            if (messageToDelete) {
                                messageToDelete.delete();
                            }
                        } catch (error) {
                            console.error("Error deleting message:", error);
                        }
                    }, 12 * 60 * 60 * 1000); // 12 часов в миллисекундах
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function formatBookingTime(dateString) {
    const bookingTime = new Date(dateString);
    const day = bookingTime.getDate().toString().padStart(2, '0');
    const month = (bookingTime.getMonth() + 1).toString().padStart(2, '0');
    const hours = bookingTime.getHours().toString().padStart(2, '0');
    const minutes = bookingTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${day}.${month} ${hours}:${minutes}`;
    return formattedTime;
}

async function clearBooking(client) {
    const guild = client.guilds.cache.get(config.GUILD_ID);
    const channel = guild.channels.cache.get(config.BOOKING_CHANNEL);
    if (channel) {
    const messages = await channel.messages.fetch();
    for (const message of messages.values()) {
        if (message.id !== activeBookingsMessageId) {
            await message.delete();
        }
    }
}
}

module.exports = {
    atcBooking,
    clearBooking
}