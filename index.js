const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, ChannelType } = require('discord.js');
const { token } = require('./config.json');
const q = require('./engine/q');

const client = new Client({
  intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMembers,
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

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	global.dumEmoji = client.emojis.cache.get('1355249879101870282');
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});



/**
 * INTERACTION HANDLER
 * This handles all interactions (slash commands) sent to the bot.
 */
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    
    const { guild, member } = interaction;
    
    // For dropdown menu
    if (interaction.isStringSelectMenu() && interaction.customId === 'class-selector') {
        // Remove all class roles first
        const classRoles = ['Adventurer', 'Guardian', 'Magic wielder'];
        for (const roleName of classRoles) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
            }
        }
        
        // Add the selected role
        if (interaction.values.length > 0) {
            const selectedRole = guild.roles.cache.find(r => r.name === interaction.values[0]);
            if (selectedRole) {
                await member.roles.add(selectedRole);
                await interaction.reply({ 
                    content: `You have chosen: ${interaction.values[0]}!`, 
                    flags: 64 
                });
            }
        } else {
            await interaction.reply({ 
                content: `You have removed your class role.`, 
                flags: 64 
            });
        }
    }
    
    // For buttons
    if (interaction.isButton() && interaction.customId.startsWith('role-')) {
        const roleName = interaction.customId === 'role-adventurer' ? 'Adventurer' :
                        interaction.customId === 'role-guardian' ? 'Guardian' :
                        interaction.customId === 'role-mage' ? 'Magic wielder' : null;
        
        if (!roleName) return;
        
        const role = guild.roles.cache.find(r => r.name === roleName);
        const hasRole = member.roles.cache.has(role.id);
        
        if (hasRole) {
            await member.roles.remove(role);
            await interaction.reply({ 
                content: `You are no longer a ${roleName}.`, 
                flags: 64 
            });
        } else {
            // Remove other class roles first
            const classRoles = ['Adventurer', 'Guardian', 'Magic wielder'];
            for (const r of classRoles) {
                const classRole = guild.roles.cache.find(role => role.name === r);
                if (classRole && member.roles.cache.has(classRole.id)) {
                    await member.roles.remove(classRole);
                }
            }
            
            await member.roles.add(role);
            await interaction.reply({ 
                content: `You have chosen: ${roleName}!`, 
                flags: 64 
            });
        }
    }
    
    // For terms agreement button
    if (interaction.isButton() && interaction.customId === 'agree-terms') {
        const { guild, member } = interaction;
        const role = guild.roles.cache.find(r => r.name === 'Player');
        
        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            await interaction.reply({ 
                content: 'Thank you for agreeing to the terms! You now have access to the game channels.', 
                flags: 64 
            });
            console.log(`Added Player role to ${member.user.tag}`);
        } else if (role && member.roles.cache.has(role.id)) {
            await interaction.reply({ 
                content: 'You have already agreed to the terms and have access to the game channels.', 
                flags: 64 
            });
        } else {
            await interaction.reply({ 
                content: 'There was an error assigning the Player role. Please contact an administrator.', 
                flags: 64 
            });
        }
    }
	
	// console.log('interaction', interaction);
	if (!interaction.isChatInputCommand()) return;
	// console.log(interaction);
	if (interaction.channelId != '1352673869013586023') {
		await interaction.reply({ content: 'Please use this command in the #game channel.', flags: 64 });
		return;
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		global.interaction = interaction;
		global.gameResponseForTranscript = [];
		if (interaction.commandName == 'startgame') {
			await command.execute(interaction);
			return;
		}
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		global.pov = pov;
		await command.execute(interaction);
		if (interaction.commandName != 'revive') await q.addThisCommandToTranscriptAsEmbed(interaction);
		// await q.addThisCommandToTranscriptAsEmbed(interaction);
		if (interaction.commandName != 'quitgame' && typeof qgame != 'undefined' && typeof pov != 'undefined' && qgame.suppressTurnScripts !== false) await require('./engine/q').runTurnScripts();
	}
	catch (error) {
		// Get user and command details for better error logging
		const username = interaction.user.username;
		const commandName = interaction.commandName;
		const options = interaction.options.data.map(opt => `${opt.name}:${opt.value}`).join(', ');

		console.error(`Error [${new Date().toLocaleString()}] for user "${username}": /${commandName} ${options}`);
		console.error(error);

		const errorMessage = 'There was an error while executing this command!';

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: errorMessage, flags: 64 });
		}
		else {
			await interaction.reply({ content: errorMessage, flags: 64 });
		}
	}
});


/**
 * MESSAGE HANDLER
 * This handles all messages posted, and DMs (sort of).
 */

client.on('ready', (c) => {
	console.log(`DUM MESSAGE HANDLER client logged in as ${c.user.tag}!`);
  });
  
client.on('messageCreate', async (message) => {
	console.log('Raw message received:', message.content);
	console.log('Message event received:', {
	  author: message.author.tag,
	  content: message.content,
	  isDM: !message.guild,
	  channel: message.channel.type
	});
	
	if (message.author.bot || message.author === 'DUM Parser#8815') return;
	
	// Check explicitly for DM channel type
	if (message.channel.type === ChannelType.DM) {
	  // console.log('DM received:', message.content);
	  // console.log(`Received DM from ${message.author.tag}: ${message.content}`);
	  
	  if (message.content.toLowerCase() === 'help') {
		message.reply("Here are commands you can use in DMs:\n• help - Shows this message\n• ping - Check if I'm online\n• about - Learn more about me");
	  } else if (message.content.toLowerCase() === 'ping') {
		message.reply("Pong! I'm here and listening.");
	  } else if (message.content.toLowerCase() === 'about') {
		message.reply("I'm DUM, a friendly Discord bot. I help manage servers and respond to various commands.");
	  } else {
		message.reply("Hello there! I'm DUM. You can type 'help' to see what commands I support in DMs.");
	  }
	  
	  return; // Exit the function to avoid processing server-specific commands
	}
	
	// Existing server message handling code continues below
	if (message.content.match(/^\//) && message.channelId === '1352673869013586023') {
	  // Check for all possible line break characters
	  if (message.content.match(/[\r\n\v\f]/)) {
		message.reply('Looks like you included a line break there. The slash commands won\'t work that way.');
	  }
	  else {
		// Check if the command exists in the commands collection
		const commandName = message.content.slice(1).trim().split(/ +/)[0];
		const command = client.commands.get(commandName);
		if (command) {
		  // Execute the command
		  try {
			global.interaction = createInteractionLikeObject(message);
			global.gameResponseForTranscript = [];
			const { qgame, pov } = await q.getGamePov();
			if (!pov) return;
			global.qgame = qgame;
			global.pov = pov;
			await command.execute(global.interaction);
			// I think the command scripts need an `interaction` object to pull data from, Claude.
			if (message.content !== 'revive') await q.addThisCommandToTranscriptAsEmbed(global.interaction);
			if (message.content !== 'quitgame' && typeof qgame !== 'undefined' && typeof pov !== 'undefined' && qgame.suppressTurnScripts !== false) await require('./engine/q').runTurnScripts();
		  } catch (error) {
			// Get user and command details for better error logging
			const username = message.author.username;
			const commandName = message.content.slice(1).trim().split(/ +/)[0];
			const options = message.content.slice(1).trim().split(/ +/).slice(1).join(' ');
			console.error(`Error [${new Date().toLocaleString()}] for user "${username}": /${commandName} ${options}`);
			console.error(error);
			const errorMessage = 'There was an error while executing this command!';
			if (message.replied || message.deferred) {
			  message.followUp({ content: errorMessage, flags: 64 });
			} else {
			  message.reply({ content: errorMessage, flags: 64 });
			}
		  }
		} else {
		  // Command not found
		  message.reply('Command not found. Please check the command name and try again.');
		}

	  }
	  message.react('🫣');
	}
   
	if (message.content.match(/^dm me, DUM$/i)){
	  message.author.send('Ping!');
	}
  
	  
	  if (message.content.toLowerCase().trim() === 'ping') {
		  message.reply('pong');
	  }
	  else if (message.content.toLowerCase().trim() === 'test') {
		  message.reply('Hi, ' + message.author.globalName + '. Test successful.');
	  }
	  else if (message.content.toLowerCase().trim() === 'tag me') {
		  message.reply('<@!' + message.author + '>');
	  }
	  else if (message.content.toLowerCase() === '!resetwarnings' && message.author.id === 'YOUR_USER_ID') {
	  const resetUser = message.mentions.users.first();
	  if (resetUser) {
		delete usersWarned[resetUser.username];
		message.reply(`Warnings reset for ${resetUser.username}`);
	  }
	}
  
	// Replace the multiple greeting/farewell checks with this more structured approach
	if (message.content.match(/\bDUM\b/i)) {
	  // Miss Mod was directly addressed
	  
	  // Check for greetings
	  if (message.content.match(/\b(h(e|a)llo|hi|hey|howdy|greetings|good morning|good day)[\s,.!?]?/i)) {
		const randomGreetings = [
		  "Hello.",
		  "Greetings."
		];
		message.reply(randomGreetings[Math.floor(Math.random() * randomGreetings.length)]);
		message.react('👋');
		return; // Prevent further processing
	  }
	  
	  // Check for the George Burns joke pattern
	  else if (message.content
		  .replace(/["',.!?]/g, "") // Remove quotes, commas, periods, exclamation marks, question marks
		  .replace(/\s+/g, " ")     // Normalize spaces
		  .toLowerCase()
		  .includes("say good night")) 
		{
		  message.reply("Good night, DUM.");
		  return;
		}
		
	  // Check for farewells
	  else if (message.content.match(/\b(goodbye|bye|see ya|good night|farewell|later)\b/i)) {
		const randomFarewells = [
		  "See you.",
		  "Goodbye."
		];
		message.reply(randomFarewells[Math.floor(Math.random() * randomFarewells.length)]);
		message.react('👋');
		return; // Prevent further processing
	  }
	  
	  
	  
	  // If Miss Mod is addressed but not with a greeting/farewell/joke
	  else {
		message.react('👀');
	  }
	} else {
	  // Miss Mod wasn't directly addressed, but we can still react to general greetings
	  if (message.content.match(/\b(hello|hi|hey)[\s,.!?]?/i) && 
		  !message.content.includes('@') &&  // Avoid reacting to greetings for others
		  Math.random() < 0.3) {  // Only react 30% of the time to avoid being annoying
		message.react('👋');
	  }
	}
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

/**
 * Helper function to create an interaction-like object from a message.
 */
function createInteractionLikeObject(message) {
  // Extract command and args from message
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  return {
    commandName,
    options: {
      getString: (name) => {
        // Simple implementation - returns first arg for any name request
        return args.join(' ');
      },
      data: args.length ? [{ name: 'content', value: args.join(' ') }] : []
    },
    user: message.author,
    replied: message.replied,
    deferred: false,
    reply: message.reply.bind(message),
    followUp: message.reply.bind(message),
    channelId: message.channelId,
    client: message.client,
    // Add this method to fix the error:
    isCommand: () => true,
    isChatInputCommand: () => true
  };
}
