const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startgame')
		.setDescription('Join the game.'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const alias = interaction.member.nickname || interaction.user.username;
		let pov = {};
		let s = '';
		if (qgame.players.indexOf(povName) < 0) {
			qgame[povName] = {
				'name': povName,
				'alias': alias,
				'userName': interaction.user.username,
				'dateJoined': Date.now(),
			};
			qgame.players.push(povName);
			pov = qgame[povName];
			if (typeof pov.parent == 'undefined') pov.parent = qgame.game.startingParent || 'Discord';
			if (typeof qgame.joinScript != 'undefined') {
				s += qgame.joinScript(povName) || '';
			}
			else {
				// default welcome message
				s += 'Welcome, ' + alias + '!\r\n\r\n';
			}

			if (typeof qgame.startScript != 'undefined') {
				qgame.startScript();
			}
			s += core.getLocationDescription(qgame, pov);
			await interaction.reply(`${alias} has joined the game!`);
			await interaction.followUp({ content: s, flags: 64 });
			try {
				await core.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			await interaction.reply({ content: 'You are already playing the game.', flags: 64 });
		}
	},
};