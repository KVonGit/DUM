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
		const txt = q.GetDisplayName(pov) + ' ' + s;
		await interaction.reply(txt);
		
		// Create a new object with only the properties you need
		const feignedInteraction = {
			user: interaction.user,
			commandName: '???',
			channel: interaction.channel,
			options: {
				getString: () => txt,
				data: []
			}
		};
		
		global.gameResponseForTranscript = [txt];
		
		await q.addThisCommandToTranscriptAsEmbed(feignedInteraction);
		await interaction.followUp({ content: 'Your fake command says: ' + q.GetDisplayName(pov) + ' ' + s, flags: 64});
		return;
	},
};
