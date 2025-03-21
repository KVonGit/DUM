const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { getInventory, template } = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quitgame')
		.setDescription('Quit playing the game.'),
	async execute(interaction) {
		fs.readFile('./game.json', 'utf8', async function(err, data) {
			if (err) {
		        return err;
			}
			if (typeof data == 'undefined' || data.trim() == '') {
				await interaction.reply({ content: 'Error!', flags: 64 });
			}
			const qgame = JSON.parse(data).aslj;
			const povName = interaction.user.username;
			const pov = qgame[povName];
			if (qgame.players.indexOf(povName) > -1) {
				qgame.players.splice(qgame.players.indexOf(povName), 1);
				console.log(JSON.stringify(qgame.players));
				// get inventory and drop it in the location of the player
				const items = getInventory(qgame, pov);
				for (const i in items) {
					qgame[items[i]].parent = pov.parent;
				}
				delete qgame[povName];
				await interaction.reply(`${povName} has left the game!`);
				await interaction.followUp({ content: '...and so ends the adventure. :grin:', flags: 64 });
				fs.writeFile('./game.json', '{"aslj":' + JSON.stringify(qgame) + '}', async function(err) {
					if (err) {
						console.log(err);
						return err;
					}
					// console.log('game data' + ' saved!');
					// console.log(JSON.stringify(qgame));
					return 0;
				});
			}
			else {
				await interaction.reply({ content: template.notPlaying, flags: 64 });
			}
		});
	},
};