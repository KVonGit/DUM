const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get little help with the game.'),
	async execute(interaction) {
		fs.readFile('./game.json', 'utf8', async function(err, data) {
			if (err) {
		        return err;
			}
			if (typeof data == 'undefined' || data.trim() == '') {
				await interaction.user.reply('Error!');
			}
			const qgame = JSON.parse(data).aslj;
			if (qgame.players.indexOf(interaction.user.username) < 0) {
				await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
				return 3;
			}
			const s = 'Enter `/` to see a list of available commands.';
			await interaction.reply({ content: s, flags: 64 });
		});
	},
};
