const { Client } = require('discord.js');
const { checkUserNicknames } = require("../Functions/auth.js");
const { atcGet } = require('../Functions/ATC/ATC_active.js');
const { atcBooking, clearBooking } = require('../Functions/ATC/ATC_booking.js');
const interval_auth = 15 * 60 * 1000; // 15 минут в миллисекундах
const interval_atc = 5 * 60 * 1000; // 5 минут в миллисекундах
const interval_booking = 30 * 1000; // 30 секунд в миллисекундах


module.exports = {
    name: "ready",
    once: true,
    async execute(client) {

        clearBooking(client);

        setInterval(() => {
            checkUserNicknames(client);
        }, interval_auth);

        setInterval(() => {
            atcGet(client);
            atcBooking(client);
        }, interval_atc);


         reconnecting = false;
         console.log(`${client.user.username} I am ready!`);
    },
};