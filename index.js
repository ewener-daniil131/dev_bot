const { Client, Events, GatewayIntentBits, Partials, Collection, UserManager } = require('discord.js');


const { Guilds, GuildMembers, GuildMessages, GuildScheduledEvents } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel } = Partials;

const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages],
	partials: [User, Message, GuildMember, ThreadMember, Channel],
});

client.commands = new 	Collection();
const config = require('./config.json');

client.on('error', (error) => {
	console.error('Произошла ошибка в клиенте Discord:', error.message);
});

client.login(config.token).then(() => {
	loadEvents(client);
	loadCommands(client);
});
