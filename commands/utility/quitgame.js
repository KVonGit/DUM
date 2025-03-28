const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quitgame')
		.setDescription('Quit playing the game.'),
	aliases: ['quit', 'q', 'leavegame', 'exitgame'],
	async execute(interaction) {
		global.interaction = interaction;
		const alias = pov.alias;
		if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
			// get inventory and drop it in the location of the player
			const items = q.getInventory(qgame, pov);
			for (const i in items) {
				// console.log('Dropping', items[i]);
				qgame.objects[items[i]].loc = pov.loc;
			}
			delete qgame.players[pov.name];
			await q.msg(`${alias} has left the game!`);
			await q.msg('...and so ends the adventure. :grin:');
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.');
			}
		}
		else {
			await q.msg(template.notPlaying);
		}
	},
};