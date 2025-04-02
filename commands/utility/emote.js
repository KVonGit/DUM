const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emote')
		.setDescription('Fake a command. Prints command response as USERNAME your_text_here')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text you wish to print as a command response')
				.setRequired(true)),
	aliases: ['feign', 'pose'],
	async execute(interaction) {
		global.interaction = interaction;
		const s = interaction.options.getString('text');
		await q.msg(q.GetDisplayName(pov) + ' ' + s, false, false);
		await q.msg('You pretend to ' + s, true, true);
	},
};
