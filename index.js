const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');
const { token } = require('./config.json');
const q = require('./engine/q'); // Add this line to require the q module

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.DirectMessages, 
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.DirectMessageReactions
  ]
});

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
			// Register aliases if they exist
			if (command.aliases) {
				for (const alias of command.aliases) {
					client.commands.set(alias, command);
				}
			}
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

Object.defineProperty(String.prototype, 'capFirst', {
	value: function() {
	  return this.charAt(0).toUpperCase() + this.slice(1);
	},
	enumerable: false,
});

// Add this function to load the game once at startup
async function loadGameOnStartup() {
  try {
    // First try to load from the channel
    console.log('Attempting to load game data from Discord channel...');
    global.qgame = await q.loadGameFromChannel(undefined, client);
    
    if (global.qgame) {
      console.log('Game loaded successfully from Discord channel');
    } else {
      // If loadGameFromChannel returns null, fall back to disk
      console.log('No game found in Discord channel, loading from disk...');
      global.qgame = await q.loadGameOnce('./game.json');
      console.log('Game loaded successfully from disk');
    }
  } catch (error) {
    console.error('Failed to load game on startup:', error);
    
    // Try the fallback if the first method threw an error
    try {
      console.log('Attempting fallback to disk...');
      global.qgame = await q.loadGameOnce('./game.json');
      console.log('Game loaded successfully from disk (fallback)');
    } catch (fallbackError) {
      console.error('All loading methods failed:', fallbackError);
    }
  }
}

client.once(Events.ClientReady, async readyClient => {
	global.dumEmoji = client.emojis.cache.get('1355249879101870282');
	console.log(`DUM INTERACTION_HANDLER client logged in as ${readyClient.user.tag}`);
	
	// Load game at startup
	await loadGameOnStartup();
});

client.on(Events.InteractionCreate, async interaction => {
	const { interactionHandler } = require('./events/interactionCreate.js');
	await interactionHandler(interaction);
	return;

});

client.on('ready', (c) => {
	console.log(`DUM MESSAGE_HANDLER client logged in as ${c.user.tag}!`);
  });
  
client.on('messageCreate', async (message) => {
	const { messageHandler } = require('./events/messageCreate.js');
	await messageHandler(message, client);
	return;
  });
  
  client.on('messageCreate', (message) => {
	// This "empty" handler helps trigger DM processing
	// Just having this with the !message.guild check seems to activate DM functionality
	if (!message.guild) {
	  // Only check for bot messages to prevent self-replies
	  if (message.author.bot) return;
	  
	  // No actual code needed here - the first handler does all the work
	  // This handler just needs to exist with the !message.guild check
	}
  });
  
  // Log in to Discord with your client's token
client.login(token);

/**
 * MESSAGE REACTION HANDLER FOR "ROLE" ASSIGNMENT
 * This handles the assignment of roles based on message reactions.
 * It uses a separate client instance to avoid conflicts with the main bot.
 */

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

clientSetterUpper.once('ready', () => {
	console.log(`DUM SETUP_HANDLER client logged in as ${clientSetterUpper.user.tag}!`);
});

clientSetterUpper.on('messageReactionAdd', async (reaction, user) => {
	const { onMessageReactionAdd } = require('./events/messageReactions.js');
	await onMessageReactionAdd(reaction, user);
	return;
	
});

clientSetterUpper.on('messageReactionRemove', async (reaction, user) => {
	const { onMessageReactionRemove } = require('./events/messageReactions.js');
	await onMessageReactionRemove(reaction, user);
	return;
});

clientSetterUpper.login(token);
