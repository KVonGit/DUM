const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

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
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (core.allPlayers(qgame).indexOf(povName) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		if (typeof core.getObject(qgame, object) == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		const obj = core.getObject(qgame, object);
		const pov = qgame.players[povName];
		// TODO - Check the object loc first!
		if (obj.loc != pov.name) {
			await interaction.reply({ content: core.template.dontHave(obj.name), flags: 64 });
			return 0;
		}
		let qdropped = false;
		if (typeof obj.drop == 'undefined' || typeof obj.drop.type == 'undefined') {
			// let it be dropped
			qdropped = true;
			obj.loc = qgame.locations[pov.loc].name;
		}
		else if (typeof obj.drop == 'string') {
			// nope
			await interaction.reply({ content: obj.take, flags: 64 });
		}
		else {
			switch (obj.drop.type) {
			case 'undefined':
			// let it be dropped
				qdropped = true;
				obj.loc = qgame.locations[pov.loc].name;
				break;
			case 'string':
			// nope
				await interaction.reply({ content: obj.take.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj.drop.attr) {
				// drop it!
					qdropped = true;
					obj.loc = qgame.locations[pov.loc].name;
				}
				else {
				// can't get it!
					await interaction.reply({ content: core.template.cantDrop(obj.name), flags: 64 });
				}
				break;
			case 'script':
			// call function
				evalThis(obj, obj.drop.attr);
				qdropped = (obj.loc != pov.name);
				break;
			}
		}
		if (qdropped) {
			// tell everybody!
			await interaction.reply(`${pov.alias} dropped ${object} in ${obj.loc}.`);
			// need to return something if take is a function, to know if it printed something!
			await interaction.followUp({ content: 'Dropped.', flags: 64 });
			try {
				await core.saveGame('./game.json', qgame);
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