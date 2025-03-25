const fs = require('fs');
const q = require('./engine/q');

module.exports.loadGame = async (filePath = './game.json') => {
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

module.exports.doLook = async () => {
	const qgame = await this.loadGame();
	if (Object.keys(qgame.players).indexOf(message.author.username) < 0) {
		await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
		return 3;
	}
	const pov = qgame.players[message.author.username];
	const s = q.getLocationDescription(qgame, pov);
	return s;
};

module.exports.doExamine = async (object) => {
	if (typeof object == 'undefined') {
		await interaction.reply('\'object\' not defined.');
		return;
	}
	const qgame = await this.loadGame();
	const povName = message.author.username;
	const pov = qgame.players[povName];
	if (Object.keys(qgame.players).indexOf(povName) < 0) {
		return q.template.mustStartGame;
	}
	const obj = q.getObject(qgame, object);;
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
		return q.template.cantSee(obj.alias || obj.name);
	}
	else if (typeof obj.look == 'undefined') {
		const s = q.template.defaultLook;
		return s;
	}
	else if (typeof obj.look == 'string') {
		return obj.look;
	}
	else if (typeof obj.look.type !== 'undefined' && obj.look.type == 'script') {
		let replyString;
		await eval (obj.look.attr);
		return replyString || q.defaultLook;
	}
	else {
		const s = q.template.defaultLook;
		return s;
	}
};