const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xyzzy')
		.setDescription('??????'),
	async execute(interaction) {
		fs.readFile('./game.json', 'utf8', async function(err, data) {
			if (err) {
		        return err;
			}
			if (typeof data == 'undefined' || data.trim() == '') {
				await interaction.user.reply({ content: 'Error!', flags: 64 });
			}
			const qgame = JSON.parse(data).aslj;
			if (qgame.players.indexOf(interaction.user.username) < 0) {
				await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
				return 3;
			}
			const s = core.template.xyzzy;
			await interaction.reply({ content: s, flags: 64 });
		});
	},
};
