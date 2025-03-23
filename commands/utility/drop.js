const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drop')
		.setDescription('Drop something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to drop')),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (q.allPlayers(qgame).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		if (typeof q.getObject(qgame, object) == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		const obj = q.getObject(qgame, object);
		const pov = qgame.players[povName];
		// TODO - Check the object parent first!
		if (obj.loc != pov.name) {
			await interaction.reply({ content: q.template.dontHave(obj.name), flags: 64 });
			return 0;
		}
		let qdropped = false;
		if (typeof obj.drop == 'undefined' || typeof obj.drop.type == 'undefined') {
			// let it be dropped
			qdropped = true;
			obj.loc = qgame.locations[pov.loc];
		}
		else if (typeof obj.drop == 'string') {
			// nope
			await interaction.reply({ content: obj.drop, flags: 64 });
		}
		else {
			switch (obj.drop.type) {
			case 'undefined':
			// let it be dropped
				qdropped = true;
				obj.loc = pov.loc;
				break;
			case 'string':
			// nope
				await interaction.reply({ content: obj.drop.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj.drop.attr) {
				// drop it!
					qdropped = true;
					obj.loc = pov.loc;
					console.log('dropped');
				}
				else {
				// can't drop it!
					await interaction.reply({ content: q.template.cantDrop(obj.name), flags: 64 });
				}
				break;
			case 'script':
			// call function
				eval(obj.drop.attr);
				qdropped = (obj.loc != pov.name);
				break;
			}
		}
		if (qdropped) {
			// tell everybody!
			await interaction.reply(`${pov.alias} dropped ${obj.alias || obj.name} in ${obj.loc}.`);
			// need to return something if take is a function, to know if it printed something!
			await interaction.followUp({ content: 'Dropped.', flags: 64 });
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			return 0;
		}

	},
};