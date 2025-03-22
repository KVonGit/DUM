// const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports.privateReply = async (interaction, s) => {
	await interaction.reply({ content: s, flags: 64 });
};

module.exports.publicReply = async (interaction, s) => {
	await interaction.reply(s);
};

module.exports.loadGame = async (filePath, interaction) => {
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
				resolve(qgame);
			}
			catch (parseError) {
				await interaction.reply({ content: 'Failed to parse game data.', flags: 64 });
				reject(parseError);
			}
		});
	});
};

module.exports.saveGame = async (filePath, qgame) => {
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

module.exports.getInventory = (qgame, pov) => {
	const inv = [];
	Object.keys(qgame).forEach(element => {
		const obj = qgame[element];
		if (typeof obj.type != 'undefined' && obj.type == 'object') {
			if (obj.parent == pov.name) {
				inv.push(obj.name);
			}
		}
	});
	return inv;
};

module.exports.getInventoryAsString = (qgame, pov) => {
	const inv = [];
	Object.keys(qgame).forEach(element => {
		const obj = qgame[element];
		if (typeof obj.type != 'undefined' && obj.type == 'object') {
			if (obj.parent == pov.name) {
				inv.push(obj.name);
			}
		}
	});
	let s = 'You are carrying';
	if (inv.length > 0) {
		// list stuff
		inv.forEach(element => {
			s += ':\r\n- ' + element;
		});
	}
	else {
		// nada
		s += ' nothing.';
	}
	return s;
};

module.exports.getLocationDescription = (qgame, pov) => {
	let s = '### ' + pov.parent + '\n';
	if (typeof qgame[pov.parent].description == 'function') {
		s += qgame[pov.parent].description();
	}
	else {
		s += qgame[pov.parent].description;
	}
	const inRoomObjects = [];
	Object.keys(qgame).forEach(element => {
		const obj = qgame[element];
		if (typeof obj.type != 'undefined' && obj.type == 'object') {
			if (obj.parent == pov.parent) {
				inRoomObjects.push(obj.name);
			}
		}
	});
	let inTheRoom = '';
	if (inRoomObjects.length > 0) {
		// list stuff
		inTheRoom += '\r\nYou can see:';
		inRoomObjects.forEach(element => {
			inTheRoom += '\r\n- ' + element;
		});
	}
	s += inTheRoom;
	let exits = '';
	if (typeof qgame[pov.parent].exits != 'undefined' && Object.keys(qgame[pov.parent].exits).length > 0) {
		// list stuff
		exits += '\nYou can go:';
		Object.keys(qgame[pov.parent].exits).forEach(dir => {
			exits += '\n' + dir;
		});
	}
	s = s + exits;
	return s;
};


module.exports.getObject = (qgame, objName) => {
	// Search for objects with type "object"
	if (qgame.objects) {
		for (const key of qgame.objects) {
			console.log('key:', key);
			const obj = qgame[key];
			console.log('obj:', obj);
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
	}

	// Search for players by name or alias
	if (qgame.players) {
		for (const playerName of qgame.players) {
			const player = qgame[playerName];
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
	}

	// If not found, return undefined
	return undefined;
};

module.exports.template = {
	'mustStartGame':'You must `/startgame` before you can play.',
	'alreadyPlaying':'You are already playing the game.',
	'notPlaying':'You are not playing the game.',
	'defaultLook':'Nothing out of the ordinary.',
	'taken':'Taken.',
	'cantGo':(exit) => {return `You can't go ${exit}!`;},
	'cantSee':(object) => {return `You can't see anything called '${object}' here!`;},
	'dontHave':(object) => {return `You don't have ${object}!`;},
	'alreadyHave':(object) => {return `You already have ${object}!`;},
	'cantTake':(object) => {return `You can't take ${object}!`;},
	'cantDrop':(object) => {return `You can't drop ${object}`;},
	'defaultAttack':(object) => {return 'Luckily for ' + object + ' (or luckily for you, depending on how that would have gone), violence is against the Discord server rules.';},
	'xyzzy':'Surprisingly, nothing happens.',
};