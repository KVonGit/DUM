const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startgame')
		.setDescription('Join the game.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const alias = interaction.member?.displayName || interaction.user.displayName || interaction.user.username;
		let pov = {};
		let s = '';

		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			qgame.players[povName] = {
				'name': povName,
				'alias': alias,
				'userName': interaction.user.username,
				'dateJoined': Date.now(),
				'commandHistory': [],
				'objectPronoun': 'them',
				'lastObject': {},
			};
			pov = qgame.players[povName];
			// TODO: Allow the player to add their objectPronoun (default to "them"), a color for their transcipt entries' embeds, text when someone looks at them, text when someone speaks to them, text when someone attacks them, and if they want other players to be able to GIVE them items or not. All are optional.

			if (typeof pov.loc === 'undefined') {
				pov.loc = qgame.game.startingLocation || 'Lounge';
			}

			if (typeof qgame.joinScript !== 'undefined') {
				s += qgame.joinScript(povName) || '';
			}
			else {
				s += `Welcome, ${alias}!\n\n`;
			}

			if (typeof qgame.startScript !== 'undefined') {
				qgame.startScript();
			}

			s += q.getLocationDescription(qgame, pov);
			await interaction.reply({ content: `${alias} has joined the game!` });
			await q.addToTranscriptChannel(`${alias} has joined the game!`);
			await interaction.followUp({ content: s, flags: 64 });

			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.reply({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			await interaction.reply({ content: 'You are already playing the game.', flags: 64 });
		}
	},
};