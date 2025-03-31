const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('note')
		.setDescription('Make a note, for the transcript.')
		.addStringOption(option =>
			option.setName('note')
				.setDescription('Add your note.')
				.setRequired(true)),
	aliases: ['testingnote'],
	async execute(interaction) {
		global.interaction = interaction;
		const alias = pov.alias;
		if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
			// TODO: send `description` to the bug report channel
			const description = interaction.options.getString('note');
			await q.msg(description);
		}
		else {
			await q.msg(template.notPlaying);
		}
	},
};