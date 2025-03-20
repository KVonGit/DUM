const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('look')
		.setDescription('Look at your surroundings.'),
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
			let s = '';
			if (typeof qgame[pov.parent].description == 'function') {
				s += qgame[pov.parent].description();
			}
			else {
				s += qgame[pov.parent].description;
			}
			const inRoomObjects = [];
			Object.keys(qgame).forEach(element => {
				const obj = qgame[element];
				if (typeof obj.type != 'undefined' && obj.type == 'object') {
					if (obj.parent == pov.parent) {
						inRoomObjects.push(obj.name);
					}
				}
			});
			let inTheRoom = '';
			if (inRoomObjects.length > 0) {
				// list stuff
				inTheRoom += 'You can see';
				inRoomObjects.forEach(element => {
					inTheRoom += ':\r\n- ' + element;
				});
			}
			s = s + '\r\n' + inTheRoom;
			await interaction.reply({ content: s, flags: 64 });
		});
	},
};
