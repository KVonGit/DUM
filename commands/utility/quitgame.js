const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quitgame')
		.setDescription('Quit playing the game.'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame[povName];
		if (qgame.players.indexOf(povName) > -1) {
			qgame.players.splice(qgame.players.indexOf(povName), 1);
			console.log(JSON.stringify(qgame.players));
			// get inventory and drop it in the location of the player
			const items = core.getInventory(qgame, pov);
			for (const i in items) {
				qgame[items[i]].parent = pov.parent;
			}
			delete qgame[povName];
			await interaction.reply(`${povName} has left the game!`);
			await interaction.followUp({ content: '...and so ends the adventure. :grin:', flags: 64 });
			try {
				await core.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			await interaction.reply({ content: template.notPlaying, flags: 64 });
		}
	},
};