const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('See what you are carrying.'),
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
				await interaction.reply({ content: 'You must /START before you can play.', flags: 64 });
				return 3;
			}
			const pov = qgame[interaction.user.username];
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
			await interaction.reply({ content: s, flags: 64 });
		});
	},
};
