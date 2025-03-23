const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quitgame')
		.setDescription('Quit playing the game.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		const alias = pov.alias;
		if (Object.keys(qgame.players).indexOf(povName) > -1) {
			// get inventory and drop it in the location of the player
			const items = q.getInventory(qgame, pov);
			for (const i in items) {
				console.log('Dropping', items[i]);
				qgame.objects[items[i]].loc = pov.loc;
			}
			delete qgame.players[povName];
			await interaction.reply(`${alias} has left the game!`);
			await interaction.followUp({ content: '...and so ends the adventure. :grin:', flags: 64 });
			try {
				await q.saveGame('./game.json', qgame);
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