const q = require('../engine/q');
const { ChannelType } = require('discord.js');

module.exports.messageHandler = async (message, client) => {
	// console.log('Raw message received:', message.content);
	/*console.log('Message event received:', {
	  author: message.author.tag,
	  content: message.content,
	  isDM: !message.guild,
	  channel: message.channel.type
	});*/
	
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
	  // DUM was directly addressed
	  
	  // Check for greetings
	  if (message.content.match(/\b(h(e|a)llo|hi|hey|howdy|greetings|good morning|good day)\b[\s,.!?]?/i)) {
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
	  
	  
	  
	  // If DUM is addressed but not with a greeting/farewell/joke
	  else {
		message.react('👀');
	  }
	} else {
	  // DUM wasn't directly addressed, but we can still react to general greetings
	  if (message.content.match(/\b(hello|hi|hey)[\s,.!?]?/i) && 
		  !message.content.includes('@') &&  // Avoid reacting to greetings for others
		  Math.random() < 0.3) {  // Only react 30% of the time to avoid being annoying
		message.react('👋');
	  }
	}
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
};