const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('put')
		.setDescription('Put something on/in something')
		.addStringOption(option =>
			option.setName('object1')
				.setDescription('The object you wish to put on/in something')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('object2')
				.setDescription('The object you wish to put something on/in')
				.setRequired(true)),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;

		if (!q.allPlayers(qgame).includes(povName)) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return;
		}

		const object1Name = interaction.options.getString('object1');
		if (!object1Name) {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}

		const obj1 = q.getObject(qgame, object1Name);
		if (!obj1) {
			await interaction.reply({ content: `No such object ("${object1Name}")!`, flags: 64 });
			return;
		}

		const object2Name = interaction.options.getString('object2');
		if (!object2Name) {
			await interaction.reply({ content: '\'' + object + '\' not defined.', flags: 64 });
			return;
		}

		const obj2 = q.getObject(qgame, object2Name);
		if (!obj2) {
			await interaction.reply({ content: `No such object ("${object2Name}")!`, flags: 64 });
			return;
		}

		const pov = qgame.players[povName];
		if (obj1.loc !== pov.name) {
			await interaction.reply({ content: q.template.dontHave(obj1.name), flags: 64 });
			return;
		}

		let wasDropped = false;
		if (!obj1.drop || !obj1.drop.type) {
			wasDropped = false;
			if (obj2.inherit.indexOf('surface') >= 0) {
				obj1.loc = obj2.name;
				wasDropped = true;
			}
			else if (obj2.inherit.indexOf('container') >= 0) {
				if (obj2.isOpen) {
					obj1.loc = obj2.name;
					wasDropped = true;
				}
				else {
					await interaction.reply({ content: q.template.containerClosed(obj2.name), flags: 64 });
				}
			}
		}
		else {
			switch (obj1.drop.type) {
			case 'string':
				await interaction.reply({ content: obj1.drop.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj1.drop.attr) {
					wasDropped = true;
					obj1.loc = obj2.name;
				}
				else {
					await interaction.reply({ content: q.template.cantDrop(obj1.name), flags: 64 });
				}
				break;
			case 'script':
				eval(obj1.drop.attr);
				wasDropped = obj1.loc !== pov.name;
				break;
			default:
				wasDropped = true;
				obj1.loc = obj2.name;
				break;
			}
		}

		if (wasDropped) {
			await interaction.reply(`${pov.alias} dropped ${obj1.alias || obj1.name} in ${pov.loc}.`);
			await interaction.followUp({ content: 'Done.', flags: 64 });
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
	},
};