const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('undo')
		.setDescription('Undo your last action.'),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		const s = q.template.noUndo;
		await interaction.reply({ content: s, flags: 64 });
	},
};
