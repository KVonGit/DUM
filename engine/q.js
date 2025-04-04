const fs = require('fs');
/* eslint-disable no-useless-escape */
module.exports.log = console.log;

module.exports.template = {
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
	'alreadyOn':(object) => {return `${object.capFirst()} is already on.`;},
	'alreadyOff':(object) => {return `${object.capFirst()} is already off.`;},
	'cantSwitch':(object) => {return `You can't switch ${object} on or off.`;},
};

module.exports.loadGame = async (filePath = './game.json') => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', async function(err, data) {
			if (err) {
				await interaction.reply({ content: 'Error!', flags: 64 });
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

module.exports.loadGameOnce = async (filePath = './game.json') => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function(err, data) {
      if (err) {
        console.error('Error loading game data:', err);
        return reject(err);
      }
      if (typeof data === 'undefined' || data.trim() === '') {
        return reject(new Error('Game data is empty or undefined.'));
      }
      try {
        const qgame = JSON.parse(data).aslj;
        resolve(qgame);
      }
      catch (parseError) {
        console.error('Failed to parse game data:', parseError);
        reject(parseError);
      }
    });
  });
};

module.exports.saveGame = async (filePath = './game.json', qgame = global.qgame) => {
	return new Promise((resolve, reject) => {
		this.saveGameToChannel();
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

module.exports.saveGameToChannel = async (game, channelId) => {
    if (!game) {
        game = global.qgame;
    }
    if (!channelId) {
        channelId = '1357777484271058964';
    }
    const channel = await interaction.client.channels.fetch(channelId);
    if (channel) {
        const jsonString = JSON.stringify(game, null, 4);
        const buffer = Buffer.from(jsonString, 'utf8');
        await channel.send({
            content: 'Game state saved',
            files: [{
                attachment: buffer,
                name: 'game-state.json'
            }]
        });
    } else {
        console.log('Channel not found!');
    }
};

module.exports.loadGameFromChannel = async (channelId, clientInstance) => {
    if (!channelId) {
        channelId = '1357777484271058964';
    }
    
    // Use the passed client or fall back to interaction.client
    const client = clientInstance || (global.interaction ? global.interaction.client : null);
    
    if (!client) {
        console.error('No Discord client available to load game from channel');
        return null;
    }
    
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.log('Channel not found!');
            return null;
        }
        
        // Fetch last messages in the channel
        const messages = await channel.messages.fetch({ limit: 10 });
        
        // Find the most recent message with a file attachment
        const messageWithFile = messages.find(msg => 
            msg.attachments.size > 0 && 
            msg.attachments.first().name === 'game-state.json'
        );
        
        if (!messageWithFile) {
            console.log('No saved game file found in channel!');
            return null;
        }
        
        // Get the attachment URL
        const attachment = messageWithFile.attachments.first();
        
        // Fetch the file content
        const response = await fetch(attachment.url);
        const data = await response.text();
        
        // Log raw data for debugging
        console.log('Raw data length:', data.length);
        
        // Parse the JSON and handle possible structures
        const parsedData = JSON.parse(data);
        let qgame;
        
        if (parsedData.aslj) {
            qgame = parsedData.aslj;
        } else {
            // If no aslj property, assume the whole object is the game
            qgame = parsedData;
        }
        
        console.log('Loading game from channel successful');
        console.log('Game data found:', qgame ? 'Yes' : 'No');
        
        return qgame;
    } catch (error) {
        console.error('Error loading game from channel:', error);
        return null;
    }
};

module.exports.AllObjects = () => {
	return Object.keys(qgame.objects);
};

module.exports.AllLocations = () => {
	return Object.keys(qgame.locations);
};

module.exports.AllPlayers = () => {
	return Object.keys(qgame.players);
};

module.exports.All = () => {
	return this.ListCombine(this.ListCombine(this.AllObjects(), this.AllPlayers()), this.AllLocations());
};

module.exports.GetObject = (objName) => {
	if (objName === 'me' || objName === 'myself') {
		objName = qgame.pov.name;
	}
	else if (objName === 'it' || objName === 'them' || objName === 'him' || objName === 'her') {
		// Check last objects for the pov!
		if (typeof pov.lastObject != 'undefined') {
			objName = pov.lastObject[objName] || objName;
		}
	}
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

module.exports.msg = async (s, isPrivate = true, isFollowUp = false) => {
	if (interaction.replied) {
		isFollowUp = true;
	}
	else {
		isFollowUp = false;
	}
	if (!isPrivate && !isFollowUp) {
		// console.log('msg: not private or follow up');
		await interaction.reply(s);
	}
	else if (!isPrivate && isFollowUp) {
		// console.log('msg: not private but is follow up');
		await interaction.followUp(s);
	}
	else if (isPrivate && !isFollowUp) {
		// console.log('msg: private but not follow up');
		await interaction.reply({ content: s, flags: 64 });
	}
	else {
		// console.log('msg: private follow up');
		await interaction.followUp({ content: s, flags: 64 });
	}
	// console.log(this.thisCommand(interaction));
	// const sBuilder = [];
	// sBuilder.push(this.GetDisplayName(pov) + ' > ' + interaction.message.content + '\n' + s);
	// await this.addToTranscriptChannel(sBuilder.join(''));
	global.gameResponseForTranscript.push(s);
};

module.exports.addToTranscriptChannel = async (s, channelId) => {
	const { ChannelType } = require('discord.js');

	async function handleInteraction(interaction) {
		if (!interaction.isCommand()) return;

		if (typeof channelId == 'undefined') channelId = '1354201798029606974';

		try {
			const channel = await interaction.client.channels.fetch(channelId);

			if (channel && channel.type === ChannelType.GuildText) {
				if (typeof s != 'string') s = { embeds: [s] };
				await channel.send(s);
			}
			else {
				console.log('Target channel is not a text channel.');
			}
		}
		catch (error) {
			console.error('Error sending message to another channel:', error);
		}

		// await interaction.followUp({ content: 'Message sent to another channel!', ephemeral: true });
	}
	await handleInteraction(interaction);
};

module.exports.sendDM = async (s) => {
	await interaction.user.send(s);
};

module.exports.getInventory = (qgame, pov) => {
	const inv = [];
	for (const element in qgame.objects) {
		const obj = qgame.objects[element];
		if (obj.loc == pov.name) {
			inv.push(obj.name);
		}
	}
	return inv;
};

module.exports.getInventoryAsString = (qgame, pov) => {
	const inv = [];
	for (const element in qgame.objects) {
		const obj = qgame.objects[element];
		if (obj.loc == pov.name) {
			inv.push(this.GetDisplayName(obj));
		}
	}
	let s = 'You are carrying:';
	if (inv.length > 0) {
		// list stuff
		inv.forEach(element => {
			s += '\r\n\- ' + element;
		});
	}
	else {
		// nada
		s += ' nothing.';
	}
	return s;
};

module.exports.getLocationDescription = (qgame, pov) => {
	// console.log('running getLocationDescription');
	const room = qgame.locations[pov.loc];
	if (typeof room == 'undefined') {
		return 'Location not found!';
	}
	let s = '### ' + this.GetDisplayName(room) + '\n';
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
			inRoomObjects.push(this.GetDisplayName(obj, false, true));
		}
	});
	Object.keys(qgame.players).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.players[obj];
		if (obj.loc == pov.loc && obj.name != pov.name) {
			inRoomObjects.push('@' + this.GetDisplayName(obj, false, true));
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

module.exports.allObjects = (qgame) => {
	return Object.keys(qgame.objects).map(key => qgame.objects[key]);
};

module.exports.AllPlayers = (qgame) => {
	return qgame.players;
};

module.exports.evalThis = (obj, scriptAttr) => {
	if (typeof obj[scriptAttr] === 'string') {
		eval(`(${obj[scriptAttr]})`).call(obj);
	}
};

module.exports.SendDM = async (s) => {
	await interaction.user.send(s);
};

module.exports.doGo = async (qgame, pov, loc, exitName, interaction) => {
	if (!loc.exits) {
		await this.msg('There are no exits!');
		return;
	}

	const synonyms = {
		'north': 'n',
		'south': 's',
		'east': 'e',
		'west': 'w',
		'northeast': 'ne',
		'northwest': 'nw',
		'southeast': 'se',
		'southwest': 'sw',
		'up': 'u',
		'down': 'd',
	};

	for (const key in synonyms) {
		if (synonyms[key] === exitName) {
			exitName = key;
		}
	}

	const exit = loc.exits[exitName];
	if (!exit) {
		await this.msg(this.template.cantGo(exitName));
		return;
	}

	if (exit.locked) {
		await this.msg(this.template.lockedExit(exitName));
		return;
	}
	if (typeof exit.visible != 'undefined' && exit.visible === false) {
		await this.msg(this.template.cantGo(exitName));
		return;
	}

	// Execute "before leaving" scripts
	if (loc.beforeLeaving) {
		let canLeave = true;
		let replyString = '';
		await eval(loc.beforeLeaving.attr);
		if (!canLeave) {
			if (replyString.length > 0) {
				await this.msg(replyString);
			}
			else {
				await this.msg('You can\'t go ' + exitName + '.');
			}
			return;
		}
		else if (replyString.length > 0) {
			await this.msg(replyString);
		}
	}

	// Update the player's location
	pov.loc = exit.to;

	// Execute "before entering" scripts
	if (qgame.locations[exit.to].afterEnteringScript) {
		eval(qgame.locations[exit.to].afterEnteringScript);
	}

	// Get the location description and respond
	const locationDescription = this.getLocationDescription(qgame, pov);
	await this.msg(`${this.GetDisplayName(pov)} goes ${exitName}, to ${this.GetDisplayName(qgame.locations[pov.loc])}.`, false, true);
	// await this.addToTranscriptChannel(`${pov.alias || pov.name} goes ${exitName}, to ${this.GetDisplayName(qgame.locations[pov.loc])}.`);
	// await this.addToTranscriptChannel(this.thisCommand);
	// await this.addThisCommandToTranscriptAsEmbed(interaction);
	// await this.addToTranscriptChannel(`> ${this.GetDisplayName(pov)} goes ${exitName}, to ${this.GetDisplayName(qgame.locations[pov.loc])}.`);
	await this.msg(locationDescription);

	// Save the game state
	try {
		await this.saveGame('./game.json', qgame);
	}
	catch (err) {
		console.error('Error saving game data:', err);
		await this.msg('Failed to save game data.', true, true);
	}
};

module.exports.GetDisplayName = (obj, definite = false, forRoomDesc = false, omitOpenClosed = false) => {
	if (typeof obj === 'string') {
		obj = this.GetObject(obj);
	}
	let n = '';
	if (obj.prefix) {
		let prefix = obj.prefix || '';
		if (definite) {
			prefix = obj.prefix || '';
			if (obj.prefix && obj.prefix === 'a') prefix = 'the';
		}
		n += prefix + ' ';
	}
	n += obj.alias || obj.name;
	if (obj.suffix) {
		n += ' ' + obj.suffix;
	}
	if (obj.listChildren && !omitOpenClosed) {
		// console.log('obj says listChildren:', obj);
		// Get the direct children of the object
		const children = this.GetDirectChildren(obj);
		// console.log('children:', children);

		// If there are children, list them
		if (obj.inherit.indexOf('container') >= 0 && (obj.isOpen === false && obj.transparent !== true)) {
			// do nothing
			n += ' (closed)';
		}
		else if (obj.inherit.indexOf('container') >= 0 && children.length > 0) {
			if (!forRoomDesc) {
				n += ' (open)';
			}
			else {
				// console.log('children:', children);
				let preString = 'containing:';
				if (obj.inherit.indexOf('surface') >= 0) {
					preString = 'on which you see:';
				}
				else if (obj.inherit.indexOf('container') >= 0) {
					preString = 'containing:';
				}
				if (typeof obj.listChildrenPreString === 'string') {
					preString = obj.listChildrenPreString;
				}
				n += ` (${preString} ${this.GetDirectChildrenAsString(obj)})`;
			}
		}
	}
	return n;
};

module.exports.FilterByType = (objectlist, objecttype) => {
	return Object.values(objectlist).filter(obj => obj.inherit && obj.inherit.includes(objecttype));
};

module.exports.FilterByGetBoolean = (objectArray, property) => {
	return objectArray.filter(obj => obj[property] === true);
};

module.exports.FilterByNotGetBoolean = (objectArray, property) => {
	return objectArray.filter(obj => obj[property] !== true);
};

module.exports.FilterByHasAttribute = (objectArray, property) => {
	return objectArray.filter(obj => Object.hasOwn(obj, property));
};

module.exports.GetDirectChildren = (obj) => {
	const allObjects = this.allObjects(qgame);
	const children = [];
	for (const o of allObjects) {
		// console.log('o:', o);
		// console.log('o.loc:', o.loc);
		// console.log('obj.name:', obj.name);
		if (o.loc === obj.name) {
			children.push(o);
		}
	}
	return children;
};

module.exports.GetDirectChildrenAsString = (obj, joiner = 'and', useOxfordComma = true) => {
	// Get all direct children of the object
	const children = this.allObjects(qgame)
		.filter(o => o.loc === obj.name)
		.map(o => this.GetDisplayName(o));

	// If no children, return an empty string
	if (children.length === 0) {
		return '';
	}

	// If only one child, return it directly
	if (children.length === 1) {
		return children[0];
	}

	// Handle multiple children
	const lastChild = children.pop();
	const separator = useOxfordComma && children.length > 1 ? ', ' : ' ';
	return children.join(', ') + separator + joiner + ' ' + lastChild;
};

module.exports.filterByType = (qgame, type, category = 'objects') => {
	// Ensure the category is valid (either 'objects' or 'players')
	if (!['objects', 'players'].includes(category)) {
		throw new Error(`Invalid category: ${category}. Must be 'objects' or 'players'.`);
	}

	// Get the list of objects or players based on the category
	const list = qgame[category];

	// Return filtered results based on the 'inherit' property
	return Object.values(list).filter(obj => obj.inherit && obj.inherit.includes(type));
};

module.exports.GetObjectListAsString = (objectList, joiner = 'and', useOxfordComma = true) => {
	// Map the object list to their display names
	// console.log('objectList:', objectList);
	const displayNames = Object.keys(objectList).map(obj => this.GetDisplayName(obj));

	// If no objects, return an empty string
	if (displayNames.length === 0) {
		return '';
	}

	// If only one object, return it directly
	if (displayNames.length === 1) {
		return displayNames[0];
	}

	// Handle multiple objects
	// // Remove the last object
	const lastObject = displayNames.pop();
	const separator = useOxfordComma && displayNames.length > 1 ? ', ' : ' ';
	return displayNames.join(', ') + separator + joiner + ' ' + lastObject;
};

module.exports.ListCombine = (list1, list2) => {
	return list1.concat(list2);
};

module.exports.ListContains = (list, item) => {
	return list.includes(item);
};

module.exports.ListRemove = (list, item) => {
	return list.filter(i => i !== item);
};

module.exports.ListAdd = (list, item) => {
	return list.concat(item);
};

module.exports.DictionaryContains = (dictionary, key) => {
	return Object.hasOwn(dictionary, key);
};

module.exports.DictionaryRemove = (dictionary, key) => {
	// eslint-disable-next-line no-unused-vars
	const { [key]: unused, ...rest } = dictionary;
	return rest;
};

module.exports.DictionaryAdd = (dictionary, key, value) => {
	// This will update if the key exists, or add it if it doesn't
	return { ...dictionary, [key]: value };
};

module.exports.DictionaryCombine = (dict1, dict2) => {
	return { ...dict1, ...dict2 };
};

module.exports.DictionaryKeys = (dictionary) => {
	return Object.keys(dictionary);
};

module.exports.DictionaryValues = (dictionary) => {
	return Object.values(dictionary);
};

module.exports.DictionaryContainsValue = (dictionary, value) => {
	return Object.values(dictionary).includes(value);
};

module.exports.DictionaryFilterByValue = (dictionary, predicate) => {
	return Object.fromEntries(
		// eslint-disable-next-line no-unused-vars
		Object.entries(dictionary).filter(([key, value]) => predicate(value)),
	);
};

module.exports.DictionaryMap = (dictionary, transform) => {
	return Object.fromEntries(
		Object.entries(dictionary).map(([key, value]) => [key, transform(value)]),
	);
};

/* example usage
const dict = { a: 1, b: 2, c: 3 };
const mappedDict = q.DictionaryMap(dict, value => value * 2);
console.log(mappedDict); // Output: { a: 2, b: 4, c: 6 }
*/

module.exports.DictionaryReduce = (dictionary, reducer, initialValue) => {
	return Object.entries(dictionary).reduce(
		(acc, [key, value]) => reducer(acc, key, value),
		initialValue,
	);
};

module.exports.type = {
	default: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	npc: {
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	male: {
		inherit: ['npc'],
		subjectPronoun: 'he',
		objectPronoun: 'him',
		possessivePronoun: 'his',
	},
	female: {
		inherit: ['npc'],
		subjectPronoun: 'she',
		objectPronoun: 'her',
		possessivePronoun: 'her',
	},
	malePlural: {
		inherit: ['male'],
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	femalePlural: {
		inherit: ['female'],
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	player: {
		subjectPronoun: 'you',
		objectPronoun: 'you',
		possessivePronoun: 'your',
	},
	animal: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	vehicle: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	surface: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	container: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
};

module.exports.getTypeDefaults = (qgame, obj) => {
	const types = obj.inherit || [];
	let resolvedDefaults = { ...q.type.default };

	for (const type of types) {
		if (q.type[type]) {
			resolvedDefaults = {
				...resolvedDefaults,
				...resolveTypeInheritance(type),
			};
		}
	}

	return resolvedDefaults;
};

// Helper function to resolve inheritance for a type
function resolveTypeInheritance(type) {
	const typeDef = q.type[type] || {};
	const inheritedTypes = typeDef.inherit || [];
	let inheritedDefaults = {};

	for (const parentType of inheritedTypes) {
		inheritedDefaults = {
			...inheritedDefaults,
			...resolveTypeInheritance(parentType),
		};
	}

	return { ...inheritedDefaults, ...typeDef };
}

module.exports.runTurnScripts = async () => {
	const allScripts = Object.keys(qgame.turnScripts) || [];
	if (allScripts.length === 0) {
		return;
	}
	const enabled = allScripts.filter(script => qgame.turnScripts[script].enabled);
	if (enabled.length === 0) {
		return;
	}
	for (const script of enabled) {
		const scriptObj = qgame.turnScripts[script];
		if (scriptObj.attr) {
			global.q = this;
			await eval(scriptObj.attr);
		}
	}
};

module.exports.openWindowProc = async () => {
	let s = 'You open the window.';
	if (this.GetObject('bee').loc == 'nowhere') {
		s += ' A bee flies in.';
		this.GetObject('bee').loc = 'Kitchen';
	}
	this.GetObject('window').isOpen = true;
	await interaction.reply({ content: s, flags: 64 });
};

module.exports.reviveBobProc = async (fromUseOn = false) => {
	const Bob = this.GetObject('Bob');
	if (fromUseOn) global.gameResponseForTranscript = [];
	if (pov.loc === 'Lounge') {
		if (Bob.alive !== true) {
			await this.msg ('Using everything you\'ve learned from TV dramas, you attempt to revive Bob.\nMiraculously, the defibrillator lived up to its promise, and Bob is now alive again. He says his head feels kind of fuzzy.');
			Bob.alive = true;

			const { ChannelType } = require('discord.js');

			async function handleInteraction(interaction) {
				if (!interaction.isCommand()) return;

				const channelId = '1352673869013586023';

				try {
					const channel = await interaction.client.channels.fetch(channelId);

					if (channel && channel.type === ChannelType.GuildText) {
						await channel.send('Bob has been revived by ' + (interaction.user.globalName || interaction.user.username) + '!');
					}
					else {
						console.log('Target channel is not a text channel.');
					}
				}
				catch (error) {
					console.error('Error sending message to another channel:', error);
				}

				// await interaction.followUp({ content: 'Message sent to another channel!', ephemeral: true });
			}
			await handleInteraction(interaction);
			await this.saveGame('./game.json', qgame);
		}
		else {
			await this.msg ('You\'ve already revived Bob!');
			await this.msg('...but, you decide the only thing to do in this game is to revive Bob, so you hit him with the juice again, despite his pleas.');
			await this.msg ('...and Bob is now lying there, a lot more still than before this turn!');
			Bob.alive = false;
			const { ChannelType } = require('discord.js');

			async function handleInteraction(interaction) {
				if (!interaction.isCommand()) return;

				const channelId = '1352673869013586023';

				try {
					const channel = await interaction.client.channels.fetch(channelId);

					if (channel && channel.type === ChannelType.GuildText) {
						await channel.send('Bob has been killed by ' + (interaction.user.globalName || interaction.user.username) + '!');
					}
					else {
						console.log('Target channel is not a text channel.');
					}
				}
				catch (error) {
					console.error('Error sending message to another channel:', error);
				}

				// await interaction.followUp({ content: 'Message sent to another channel!', ephemeral: true });
			}
			await handleInteraction(interaction);
			await this.saveGame('./game.json', qgame);
		}
	}
	else {
		await this.msg ('Don\'t worry. The men in white coats will arrive to help you soon!');
	}
	await this.addThisCommandToTranscriptAsEmbed(interaction);
};

module.exports.scopeVisible = (pov) => {
	const visibleObjects = [];

	// Check if obj has a location
	if (typeof pov.loc == 'undefined') return visibleObjects;

	// Get objects in the same location
	const everything = Object.keys(qgame.objects).concat(Object.keys(qgame.players));
	// console.log('everything:', everything);
	for (const key of everything) {
		// console.log('key:', key);
		const item = this.GetObject(key);
		// console.log('item:', item);
		// console.log('pov', pov);
		if ((item.loc === pov.loc || item.loc === pov.name) && item.visible !== false) {
			// console.log('item is visible:', item.name);
			visibleObjects.push(item);
		}
	}

	// console.log('Checking for things in open containers and surfaces...');
	// Include objects in open containers and on surfaces
	for (const key of everything) {
		const obj = this.GetObject(key);
		if (visibleObjects.includes(this.GetObject(obj.loc))) {
			if (this.GetObject(obj.loc).isOpen === true && obj.visible !== false) {
				// console.log('obj is visible:', obj.name);
				visibleObjects.push(obj);
			}
			if (this.GetObject(obj.loc).inherit?.indexOf('surface') >= 0 && obj.visible !== false) {
				// console.log('obj is visible:', obj.name);
				visibleObjects.push(obj);
			}
		}
	}
	// console.log('visibleObjects:', visibleObjects);
	return visibleObjects;
};

module.exports.inScope = (obj) => {
	return this.scopeVisible(pov || qgame.players[interaction.user.username]).includes(obj);
};

module.exports.scopeVisibleNotHeld = () => {
	const visibleObjects = this.scopeVisible();
	const heldObjects = this.getInventory(qgame, pov);
	return visibleObjects.filter(obj => !heldObjects.includes(obj.name));
};

module.exports.scopeInventory = () => {
	const visibleObjects = this.scopeVisible(pov);
	const heldObjects = this.getInventory(qgame, pov);
	return visibleObjects.filter(obj => heldObjects.includes(obj.name));
};

module.exports.getAttribute = (obj, attr) => {
	const objAttr = {};
	// console.log('getAttribute: obj:', obj);
	// console.log('getAttribute: attr:', attr);
	// console.log('typeof obj[attr]:', typeof obj[attr]);
	// console.log('obj[attr]:', obj[attr]);
	if (typeof obj[attr] != 'undefined') {
		objAttr.type = typeof obj[attr];
		// console.log('objAttr.type:', objAttr.type);
		if (objAttr.type === 'object') {
			objAttr.type = obj[attr].type;
			objAttr.attr = obj[attr]['attr'];
		}
		else {
			objAttr.attr = obj[attr];
		}
		// console.log('objAttr:', objAttr);
		return objAttr;
	}
	return {};
};

module.exports.getGamePov = async () => {
  let qgame = global.qgame;
  
  // If the game isn't loaded yet or needs to be refreshed, try loading it
  if (!qgame) {
    try {
      qgame = await this.loadGameOnce('./game.json');
      global.qgame = qgame;
    } catch (error) {
      console.error('Failed to load game:', error);
      if (global.interaction) {
        await global.interaction.reply({ content: 'Error loading game data.', flags: 64 });
      }
      return {};
    }
  }
  
  // Get the player's name from the interaction
  const povName = global.interaction.user.username;
  
  // Check if the player exists in the game
  if (Object.keys(qgame.players).indexOf(povName) < 0) {
    await this.msg(this.template.mustStartGame);
    console.log('Player not found in game:', povName);
    return {};
  }
  
  const pov = qgame.players[povName];
  return { qgame, pov };
};

module.exports.thisCommand = (interaction) => {
	const povName = interaction.user.username;
	const commandName = interaction.commandName;

	// Extract options dynamically, handling 0-2 options with arbitrary names
	const optionsString = interaction.options.data
		.map(option => `${option.name}: ${option.value}`)
		.join(' ');

	// Construct the final string
	const commandString = povName + ' @ ' + new Date() + '\n> /' + commandName + ' ' + optionsString + ''.trim();

	// console.log('thisCommand:', commandString);
	return commandString;
};

const { EmbedBuilder } = require('discord.js');

module.exports.addThisCommandToTranscriptAsEmbed = async (interaction, transcriptChannel, color) => {
	if (typeof transcriptChannel == 'undefined') transcriptChannel = '1354201798029606974';
	const povName = interaction.user.globalName || interaction.user.username;
	const commandName = interaction.commandName;

	const optionsString = interaction.options.data
		.map(option => `${option.name}: ${option.value} `)
		.join(' ');

	const commandString = `**>** \`/${commandName}\` ${optionsString}`.trim();
	const userProfileURL = `https://discord.com/users/${interaction.user.id}`;

	const colors = {
		'kv_online': 0x228B22,
		'ajbruner77': 0x23478B,
		'pertex1': 0x4487ec,
		'default': 0x00AE86,
		'red': 0xFF0000,
		'green': 0x00FF00,
		'blue': 0x0000FF,
		'yellow': 0xFFFF00,
		'purple': 0x800080,
		'cyan': 0x00FFFF,
		'pink': 0xFFC0CB,
		'orange': 0xFFA500,
		'brown': 0xA52A2A,
		'black': 0x000000,
		'white': 0xFFFFFF,
		'gray': 0x808080,
		'grey': 0x808080,
		'gold': 0xFFD700,
		'silver': 0xC0C0C0,
		'bronze': 0xCD7F32,
		'Forest Green': 0x228B22,
		'Hunter Green': 0x355E3B,
		'Dark Green': 0x006400,
		'British Racing Green': 0x004225,
		'Moss Green': 0x8A9A5B,
		'Evergreen': 0x05472A,
		'Pine Green': 0x01796F,
		'Bottle Green': 0x006A4E,
		'Brunswick Green': 0x1B4D3E,
		'Sacramento Green': 0x043927,
	};

	// Create the embed
	const embed = new EmbedBuilder()
		.setAuthor({ name: povName, iconURL: interaction.user.displayAvatarURL(), url: userProfileURL })
		.setDescription(commandString + '\n\n' + global.gameResponseForTranscript.join('\n'))
		.setColor(color || colors[interaction.user.username] || colors['default'])
		.setTimestamp()
		// .setFooter({ text: 'Command processed by: DUM Parser 🤖' });
		// .setFooter({ text: 'Command processed by: DUM Parser', iconURL: 'https://cdn.discordapp.com/emojis/1355249879101870282.png' });
		.setFooter({ text: 'Command processed by: DUM Parser' });

	// Send embed to the interaction channel
	// await interaction.followUp({ embeds: [embed] });

	await this.addToTranscriptChannel(embed);
};
