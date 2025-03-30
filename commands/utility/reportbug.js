const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reportbug')
		.setDescription('Quit playing the game.')
		.addStringOption(option =>
			option.setName('description')
				.setDescription('Describe the bug you encountered.')
				.setRequired(true)),
	aliases: ['bug', 'bugreport'],
	async execute(interaction) {
		global.interaction = interaction;
		const alias = pov.alias;
		if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
			// TODO: send `description` to the bug report channel
			const description = interaction.options.getString('description');
			const bugReportChannel = interaction.client.channels.cache.find(channel => channel.name === 'bug-reports');
			if (bugReportChannel) {
				await bugReportChannel.send(`Bug report from ${alias} (${pov.name}): ${description}`);
				await q.msg('Thank you for your bug report! We appreciate your feedback.');
			}
			else {
				await q.msg('Bug report channel not found. Please contact an admin.');
			}
		}
		else {
			await q.msg(template.notPlaying);
		}
	},
};