const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quitgame')
		.setDescription('Quit playing the game.'),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) {
			console.warning('no pov returned to quitgame.js');
			return;
		}
		const alias = pov.alias;
		if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
			// get inventory and drop it in the location of the player
			const items = q.getInventory(qgame, pov);
			for (const i in items) {
				console.log('Dropping', items[i]);
				qgame.objects[items[i]].loc = pov.loc;
			}
			delete qgame.players[pov.name];
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