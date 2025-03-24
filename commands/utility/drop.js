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
		const objectName = interaction.options.getString('object');
		if (!objectName) {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}

		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;

		if (!q.allPlayers(qgame).includes(povName)) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return;
		}

		const obj = q.getObject(qgame, objectName);
		if (!obj) {
			await interaction.reply({ content: `No such object ("${objectName}")!`, flags: 64 });
			return;
		}

		const pov = qgame.players[povName];
		if (obj.loc !== pov.name) {
			await interaction.reply({ content: q.template.dontHave(obj.name), flags: 64 });
			return;
		}

		let wasDropped = false;

		if (!obj.drop || !obj.drop.type) {
			wasDropped = true;
			obj.loc = pov.loc;
		}
		else {
			switch (obj.drop.type) {
			case 'string':
				await interaction.reply({ content: obj.drop.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj.drop.attr) {
					wasDropped = true;
					obj.loc = pov.loc;
				}
				else {
					await interaction.reply({ content: q.template.cantDrop(obj.name), flags: 64 });
				}
				break;
			case 'script':
				eval(obj.drop.attr);
				wasDropped = obj.loc !== pov.name;
				break;
			default:
				wasDropped = true;
				obj.loc = pov.loc;
				break;
			}
		}

		if (wasDropped) {
			await interaction.reply(`${pov.alias} dropped ${obj.alias || obj.name} in ${pov.loc}.`);
			await interaction.followUp({ content: 'Dropped.', flags: 64 });
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