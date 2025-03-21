const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startgame')
		.setDescription('Join the game.'),
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
			let pov = {};
			let s = '';
			if (qgame.players.indexOf(povName) < 0) {
				qgame[povName] = {
					'name':povName,
				    'userName':povName,
				    'dateJoined': Date.now(),
				};
				qgame.players.push(povName);
				pov = qgame[povName];
				if (typeof pov.parent == 'undefined') pov.parent = qgame.game.startingParent || 'Discord';
				if (typeof qgame.joinScript != 'undefined') {
					s += qgame.joinScript(povName) || '';
				}
				else {
					// default welcome message?
					s += 'Welcome, ' + povName + '!\r\n\r\n';
				}

				if (typeof qgame.startScript != 'undefined') {
					qgame.startScript();
				}
				s += core.getLocationDescription(qgame, pov);
				await interaction.reply(`${povName} has joined the game!`);
				await interaction.followUp({ content: s, flags: 64 });
				fs.writeFile('./game.json', '{"aslj":' + JSON.stringify(qgame) + '}', async function(err) {
					if (err) {
						console.log(err);
						return err;
					}
					console.log('game data' + ' saved!');
					return 0;
				});
			}
			else {
				await interaction.reply({ content: 'You are already playing the game.', flags: 64 });
			}
		});
	},
};