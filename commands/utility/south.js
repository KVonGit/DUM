const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('south')
		.setDescription('Go south'),
	async execute(interaction) {
		const exitName = 'south';
		// console.log('exitName:', exitName);
		fs.readFile('./game.json', 'utf8', async function(err, data) {
			if (err) {
				await interaction.user.reply({ content: 'Error!', flags: 64 });
		  		return err;
			}
			if (typeof data == 'undefined' || data.trim() == '') return;
			const qgame = JSON.parse(data).aslj;
			const povName = interaction.user.username;
			if (qgame.players.indexOf(povName) < 0) {
				await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
				return 3;
			}
			const pov = qgame[povName];
			const loc = qgame[pov.parent];
			if (typeof loc.exits == 'undefined') {
				await interaction.reply({ content: 'There are no exits!', flags: 64 });
				return;
			}
			if (typeof loc.exits[exitName] == 'undefined') {
				await interaction.reply({ content: core.template.cantGo(exitName), flags: 64 });
				return;
			}
			const exitTo = loc.exits[exitName];
			console.log('exitTo', exitTo);
			pov.parent = exitTo;
			const s = core.getLocationDescription(qgame, pov);
			await interaction.reply(`${povName} goes ${exitName}.`);
			await interaction.followUp({ content: s, flags: 64 });
			fs.writeFile('./game.json', '{"aslj":' + JSON.stringify(qgame) + '}', async function(err) {
				if (err) {
					console.log(err);
					return err;
				}
				console.log('game data' + ' saved!');
				return 0;
			});
		});
	},
};