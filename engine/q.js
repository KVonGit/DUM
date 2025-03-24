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
	'containerClosed':(object) => {return `${object} is closed.`;},
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

module.exports.saveGame = async (filePath = './game.json', qgame = qgame) => {
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

module.exports.AllObjects = () => {
	return Object.keys(qgame.objects);
};

module.exports.AllLocations = () => {
	return Object.keys(qgame.locations);
};

module.exports.AllPlayers = () => {
	return Object.keys(qgame.players);
};

module.exports.GetObject = (objName) => {
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
	if (!isPrivate && !isFollowUp) {
		await interaction.reply(s);
	}
	else if (!isPrivate && isFollowUp) {
		// await interaction.user.send(s);
		await interaction.followUp(s);
	}
	else if (isPrivate && !isFollowUp) {
		await interaction.reply({ content: s, flags: 64 });
	}
	else {
		// await interaction.user.send({content: s, flags: 64});
		await interaction.followUp({ content: s, flags: 64 });
	}
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
			inv.push(obj.name);
		}
	}
	let s = 'You are carrying';
	if (inv.length > 0) {
		// list stuff
		inv.forEach(element => {
			s += ':\r\n\- ' + element;
		});
	}
	else {
		// nada
		s += ' nothing.';
	}
	return s;
};

module.exports.getLocationDescription = (qgame, pov) => {
	const room = qgame.locations[pov.loc];
	if (typeof room == 'undefined') {
		return 'Location not found!';
	}
	let s = '### ' + room.name + '\n';
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
			inRoomObjects.push(obj.alias || obj.name);
		}
	});
	Object.keys(qgame.players).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.players[obj];
		if (obj.loc == pov.loc && obj.name != pov.name) {
			inRoomObjects.push('@' + obj.alias || obj.name);
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


module.exports.getObject = (qgame, objName) => {
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

module.exports.allObjects = (qgame) => {
	return Object.keys(qgame.objects);
};

module.exports.allPlayers = (qgame) => {
	return Object.keys(qgame.players);
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
		await interaction.reply({ content: 'There are no exits!', flags: 64 });
		return;
	}

	const exit = loc.exits[exitName];
	if (!exit) {
		await interaction.reply({ content: this.template.cantGo(exitName), flags: 64 });
		return;
	}

	if (exit.locked) {
		await interaction.reply({ content: this.template.lockedExit(exitName), flags: 64 });
		return;
	}
	if (typeof exit.visible != 'undefined' && exit.visible === false) {
		await interaction.reply({ content: this.template.cantGo(exitName), flags: 64 });
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
	const locationDescription = this.getLocationDescription(qgame, pov);
	await interaction.reply(`${pov.alias || pov.name} goes ${exitName}.`);
	await interaction.followUp({ content: locationDescription, flags: 64 });

	// Save the game state
	try {
		await this.saveGame('./game.json', qgame);
	}
	catch (err) {
		console.error('Error saving game data:', err);
		await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
	}
};

module.exports.GetDisplayName = (obj) => {
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