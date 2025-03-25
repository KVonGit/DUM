const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');
const { token } = require('./config.json');

const clientK = new Client({
	 intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.MessageContent,
	],
});
clientK.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


clientK.login(token);
clientK.on(Events.MessageCreate, async message => {
	if (message.author.bot || message.channelId != '1353941635859353670') return;
	console.log('message', message);
	global.message = message;
	const regExp = {
		'look': /^(l|look)$/,
		'go': /^(go)?( )?(to)?( )?( the )?(?<dir>(north|n|northwest|nw|west|w|southwest|sw|south|s|southeast|se|east|e|northeast|ne|in|out|o|up|u|down|d))$/i,
		'examine': /^(x|examine|look at) (a |an |the |)(?<obj>.+)$/i,
		'take': /^(?:take|get) (a |an |the |)(?<obj>.+)$/i,
		'inventory': /^(i|inventory)$/i,
		'drop': /^(drop|put down) (a |an |the |)(?<obj>.+)$/i,
		'attack': /^(attack|hit|kill) (a |an |the |)(?<obj>.+)$/i,
		'speak': /^(speak to|talk to) (a |an |the |)(?<obj>.+)$/i,
		'undo': /^(undo)$/i,
		'save': /^(save)$/i,
		'xyzzy': /^(xyzzy)$/i,
		'open': /^(open) (a |an |the |)(?<obj>.+)$/i,
		'close': /^(close) (a |an |the |)(?<obj>.+)$/i,
		'puton': /^put (?<obj1>.+) on (?<obj2>)$/i,
		'putin': /^put (?<obj1>.+) in (?<obj2>.+)$/i,
		'putunder': /^put (?<obj1>.+) under (?<obj2>.+)$/i,
		'putbehind': /^put (?<obj1>.+) behind (?<obj2>.+)$/i,
		'putbeside': /^put (?<obj1>.+) beside (?<obj2>.+)$/i,
		'putinfront': /^put (?<obj1>.+) in front of (?<obj2>.+)$/i,
		'about': /^(version|info|information|about)$/i,
		'help': /^(help)$/i,
		'hint': /^(hint)$/i,
		'switchon': /^(switch on|turn on) (a |an |the |)(?<obj>.+)$/i,
		'switchoff': /^(switch off|turn off) (a |an |the |)(?<obj>.+)$/i,
		'push': /^(push) (a |an |the |)(?<obj>.+)$/i,
		'pull': /^(pull) (a |an |the |)(?<obj>.+)$/i,
		'climb': /^(climb) (a |an |the |)(?<obj>.+)$/i,
		'jump': /^(jump) (a |an |the |)(?<obj>.+)$/i,
		'eat': /^(eat) (a |an |the |)(?<obj>.+)$/i,
		'drink': /^(drink) (a |an |the |)(?<obj>.+)$/i,
		'wear': /^(wear) (a |an |the |)(?<obj>.+)$/i,
		'remove': /^(remove) (a |an |the |)(?<obj>.+)$/i,
		'time': /^(time|clock)$/i,
		'note': /^\W/,
		'oops': /^oops (?<obj>.+)$/i,
		'tell': /^tell (?<obj>.+?) (about )?(?<topic>.+)$/i,
		'ask': /^ask (?<obj>.+?) (about )?(?<topic>.+)$/i,
		'give': /^give (?<obj1>.+?) to (?<obj2>.+)$/i,
		'buy': /^buy (?<obj>.+)$/i,
		'sell': /^sell (?<obj>.+)$/i,
		'wait': /^(wait|z)$/i,
		'quit': /^(quit|exit)$/i,
	};
	let foundCommand = false;
	for (const [command, regex] of Object.entries(regExp)) {
		const match = message.content.match(regex);
		if (match) {
			foundCommand = true;
			await handleCommand(command, match.groups);
			break;
		}
	}
	if (!foundCommand) {
		await message.reply('Command not recognized');
		return;
	}

	async function handleCommand(command, groups) {
		switch (command) {
		case 'look':
			lookResponse = await doLook();
			await message.reply(lookResponse);
			break;

		case 'examine':
			object = groups?.obj?.trim() || 'something';
			examineResponse = await doExamine(object);
			await message.reply({ content: examineResponse, flags: 64 });
			break;

		case 'take':
			takeObject = groups?.obj?.trim();
			await message.reply(`You want to take: ${takeObject}`);
			break;

			// Add cases for other commands as needed
		case 'go':
			dir = groups.dir;
			switch (dir) {
			case 'n':
				dir = 'north';
				break;
			case 'ne':
				dir = 'northeast';
				break;
			case 'nw':
				dir = 'northwest';
				break;
			case 's':
				dir = 'south';
				break;
			case 'se':
				dir = 'southeast';
				break;
			case 'sw':
				dir = 'southwest';
				break;
			case 'e':
				dir = 'east';
				break;
			case 'w':
				dir = 'west';
				break;
			case 'o':
				dir = 'out';
				break;
			case 'u':
				dir = 'up';
				break;
			case 'd':
				dir = 'down';
				break;
			case 'f':
				dir = 'fore';
				break;
			case 'a':
				dir = 'aft';
				break;
			case 'sb':
				dir = 'starboard';
				break;
			case 'p':
				dir = 'port';
				break;
			}
			qgame = await loadGame();
			pov = qgame.players[message.author.username];
			loc = qgame.locations[pov.loc];
			await doGo(pov, loc, dir);
			break;

		default:
			await message.reply(`Command "${command}" is recognized but not yet implemented.`);
		}
	}


});

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
/*

// This actually works, converting the ASLX file to JSON and parsing it, but I don't wish to use actual nested objects for locations (parents).

const parser = require('xml2json');
fs.readFile('./game.aslx', 'utf8', function(err, data) {
	const json = parser.toJson(data);
	fs.writeFile('./game.json', json, function(err) {
		if (err) {
			console.error('Error saving game data:', err);
			return (err);
		}
		console.log('Game data saved!');
	});
});
*/


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
		require('./engine/q').runTurnScripts();
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


const loadGame = async (filePath = './game.json') => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', async function(err, data) {
			if (err) {
				return reject(err);
			}
			if (typeof data === 'undefined' || data.trim() === '') {
				return reject(new Error('Game data is empty or undefined.'));
			}
			try {
				const qgame = JSON.parse(data).aslj;
				global.qgame = qgame;
				resolve(qgame);
			}
			catch (parseError) {
				await interaction.reply({ content: 'Failed to parse game data.', flags: 64 });
				reject(parseError);
			}
		});
	});
};

const saveGame = async (filePath = './game.json', qgame = qgame) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, JSON.stringify({ aslj: qgame }, null, 4), function(err) {
			if (err) {
				console.error('Error saving game data:', err);
				return reject(err);
			}
			console.log('Game data saved!');
			resolve();
		});
	});
};

const getObject = (objName) => {
	for (const key of Object.keys(qgame.objects)) {
		// console.log('key:', key);
		const obj = qgame.objects[key];
		// console.log('obj:', obj);
		objName = objName.toLowerCase().trim();
		if (obj.name.toLowerCase() === objName || (typeof obj.alias != 'undefined' && obj.alias.toLowerCase() === objName)) {
			return obj;
		}
		if (typeof obj.alt != 'undefined') {
			for (const alt of obj.alt) {
				if (alt.toLowerCase() === objName) {
					return obj;
				}
			}
		}
	}
	// Search for players by name or alias

	for (const playerName of Object.keys(qgame.players)) {
		const player = qgame.players[playerName];
		if (player.name.toLowerCase() === objName || player.alias.toLowerCase() === objName) {
			return player;
		}
		if (player.alt) {
			for (const alt of player.alt) {
				if (alt.toLowerCase() === objName) {
					return player;
				}
			}
		}
	}

	// If not found, return undefined
	return undefined;
};

const doLook = async () => {
	const qgame = await loadGame();
	if (Object.keys(qgame.players).indexOf(message.author.username) < 0) {
		return template.mustStartGame;
	}
	const pov = qgame.players[message.author.username];
	const s = getLocationDescription(pov);
	return s;
};

const getLocationDescription = (pov) => {
	const room = qgame.locations[pov.loc];
	if (typeof room == 'undefined') {
		return 'Location not found!';
	}
	let s = '### ' + getDisplayName(room) + '\n';
	if (typeof room.description == 'function') {
		s += room.description();
	}
	else {
		s += room.description;
	}
	const inRoomObjects = [];
	Object.keys(qgame.objects).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.objects[obj];
		if (obj.loc == pov.loc && !obj.scenery) {
			inRoomObjects.push(getDisplayName(obj));
		}
	});
	Object.keys(qgame.players).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.players[obj];
		if (obj.loc == pov.loc && obj.name != pov.name) {
			inRoomObjects.push('@' + getDisplayName(obj));
		}
	});
	let inTheRoom = '';
	if (inRoomObjects.length > 0) {
		// list stuff
		inTheRoom += '\r\nYou can **see**:';
		inRoomObjects.forEach(element => {
			inTheRoom += '\r\n\- ' + element;
		});
	}
	s += inTheRoom;
	let exits = '';
	if (typeof room.exits != 'undefined' && Object.keys(room.exits).length > 0) {
		// list stuff
		exits += '\nYou can **go**:';
		Object.keys(room.exits).forEach(dir => {
			exits += '\n\- ' + dir;
		});
	}
	s = s + exits;
	return s;
};

const getDisplayName = (obj) => {
	if (typeof obj === 'string') {
		obj = getObject(obj);
	}
	let n = '';
	if (obj.prefix) {
		n += obj.prefix + ' ';
	}
	n += obj.alias || obj.name;
	if (obj.suffix) {
		n += ' ' + obj.suffix;
	}
	if (obj.listChildren) {
		n += ' (' + obj.listChildren() + ')';
	}
	return n;
};

const doExamine = async (object) => {
	if (typeof object == 'undefined') {
		await interaction.reply('\'object\' not defined.');
		return;
	}
	const qgame = await loadGame();
	const povName = message.author.username;
	const pov = qgame.players[povName];
	if (Object.keys(qgame.players).indexOf(povName) < 0) {
		return template.mustStartGame;
	}
	const obj = getObject(object);;
	if (obj == 'undefined') {
		return 'No such object ("' + object + '")!';
	}
	// TODO - Check scope!
	/*
	if (typeof warned[pov.name] == 'undefined') {
		warned[pov.name] = true;
		await q.privateMessage(interaction, 'Hey, ' + pov.alias + '... Tell the admin to fix the `/look` command! It does not check scope, location, or anything else!');
	}
	*/
	if ((obj.loc != pov.loc && obj.loc !== pov.name) || obj.visible === false) {
		return template.cantSee(obj.alias || obj.name);
	}
	else if (typeof obj.look == 'undefined') {
		const s = template.defaultLook;
		return s;
	}
	else if (typeof obj.look == 'string') {
		return obj.look;
	}
	else if (typeof obj.look.type !== 'undefined' && obj.look.type == 'script') {
		let replyString;
		await eval (obj.look.attr);
		return replyString || template.defaultLook;
	}
	else {
		const s = template.defaultLook;
		return s;
	}
};

const sendDM = async (s) => {
	await message.reply(s);
};

const template = {
	'mustStartGame':'You must `/startgame` before you can play.',
	'alreadyPlaying':'You are already playing the game.',
	'notPlaying':'You are not playing the game.',
	'defaultLook':'Nothing out of the ordinary.',
	'taken':'Taken.',
	'dropped':'Dropped.',
	'cantGo':(exit) => {return `You can't go ${exit}!`;},
	'cantSee':(object) => {return `You can't see anything called '${object}' here!`;},
	'dontHave':(object) => {return `You don't have ${object}!`;},
	'alreadyHave':(object) => {return `You already have ${object}!`;},
	'cantTake':(object) => {return `You can't take ${object}!`;},
	'cantDrop':(object) => {return `You can't drop ${object}`;},
	'defaultAttack':(object) => {return 'Luckily for ' + object + ' (or luckily for you, depending on how that would have gone), violence is against the Discord server rules.';},
	'xyzzy':'Surprisingly, nothing happens.',
	'defaultSpeakTo':(object) => {return 'You speak to ' + object + '.';},
	'oops':'There is nothing to correct.',
	'noUndo':'You can\'t use UNDO in a multiplayer game.',
	'noSave':'You can\'t save in a multiplayer game.',
	'containerClosed':(object) => {return `${object.capFirst()} is closed.`;},
	'defaultOpen':(object) => {return `You open ${object}.`;},
	'alreadyOpen':(object) => {return `${object.capFirst()} is already open.`;},
	'defaultClose':(object) => {return `You close ${object}.`;},
	'alreadyClosed':(object) => {return `${object.capFirst()} is already closed.`;},
	'cantOpenOrClose':(object) => {return `${object.capFirst()}: not openable or closeable.`;},
};

const doGo = async (pov, loc, exitName) => {
	if (!loc.exits) {
		await message.reply({ content: 'There are no exits!', flags: 64 });
		return;
	}

	const exit = loc.exits[exitName];
	if (!exit) {
		await message.reply({ content: template.cantGo(exitName), flags: 64 });
		return;
	}

	if (exit.locked) {
		await message.reply({ content: template.lockedExit(exitName), flags: 64 });
		return;
	}
	if (typeof exit.visible != 'undefined' && exit.visible === false) {
		await message.reply({ content: template.cantGo(exitName), flags: 64 });
		return;
	}

	// Execute "before leaving" scripts
	if (loc.beforeLeavingScript) {
		eval(loc.beforeLeavingScript);
	}

	// Update the player's location
	pov.loc = exit.to;

	// Execute "before entering" scripts
	if (qgame.locations[exit.to].afterEnteringScript) {
		eval(qgame.locations[exit.to].afterEnteringScript);
	}

	// Get the location description and respond
	const locationDescription = getLocationDescription(pov);
	await message.reply(`${pov.alias || pov.name} goes ${exitName}.`);
	await message.reply({ content: locationDescription, flags: 64 });

	// Save the game state
	try {
		await saveGame('./game.json', qgame);
	}
	catch (err) {
		console.error('Error saving game data:', err);
		await message.reply({ content: 'Failed to save game data.', flags: 64 });
	}
};

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
	console.log(`Logged in as ${clientSetterUpper.user.tag}!`);
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
