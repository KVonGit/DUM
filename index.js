const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

global.Log = console.log;

Object.defineProperty(String.prototype, 'capFirst', {
	value: function() {
	  return this.charAt(0).toUpperCase() + this.slice(1);
	},
	enumerable: false,
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);


client.on(Events.InteractionCreate, async interaction => {
	// console.log('interaction', interaction);
	if (!interaction.isChatInputCommand()) return;
	// console.log(interaction);
	if (interaction.channelId != '1352673869013586023') {
		await interaction.reply({ content: 'Please use this command in the #game channel.', flags: 64 });
		return;
	}
	global.interaction = interaction;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
		if (typeof qgame !== 'undefined' && typeof pov !== 'undefined') require('./engine/q').runTurnScripts();
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
		}
	}
});


const { Partials } = require('discord.js');

const clientSetterUpper = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Message, Partials.Reaction, Partials.User],
});

// Map of emoji to role names
let roleMap = {
	'🤼': 'Adventurer',
	'🤺': 'Guardian',
	'🧙': 'Magic wielder',
};

const TARGET_MESSAGE_ID = '1353954120402210827';

clientSetterUpper.once('ready', () => {
	console.log(`SetterUpper logged in as ${clientSetterUpper.user.tag}!`);
});

clientSetterUpper.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.message.id === TARGET_MESSAGE_ID) {
		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;

		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === roleName);

		if (role && member) {
			await member.roles.add(role);
			console.log(`Added role ${roleName} to ${user.tag}`);
		}
	}
	else if (reaction.message.id === '1353949535172300892') {
	// Agreeing to terms assigns the "Player" role to the user, which unlocks the #game channel
		roleMap = {
			'✅': 'Player',
		};
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;
		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === 'Player');
		if (role && member) {
			await member.roles.add(role);
			console.log(`Added role ${roleName} to ${user.tag}`);
		}
	}
	else {
		return;
	}
});

clientSetterUpper.on('messageReactionRemove', async (reaction, user) => {
	if (reaction.message.id === TARGET_MESSAGE_ID) {
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;

		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === roleName);

		if (role && member) {
			await member.roles.remove(role);
			console.log(`Removed role ${roleName} from ${user.tag}`);
		}
	}
	else if (reaction.message.id === '1353949535172300892') {
	// Agreeing to terms assigns the "Player" role to the user, which unlocks the #game channel
		roleMap = {
			'✅': 'Player',
		};
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;
		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === 'Player');
		if (role && member) {
			await member.roles.remove(role);
			console.log(`Removed role ${roleName} from ${user.tag}`);
		}
	}
	else {
		return;
	}
});

clientSetterUpper.login(token);
