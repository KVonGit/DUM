const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('read')
		.setDescription('Read something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to read')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (typeof obj.read == 'undefined') {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
		}
		else if (obj.read === true) {
			obj.loc = 'nowhere';
			await interaction.reply({ content: 'You read for a while.', flags: 64 });
		}
		else if (typeof obj.read == 'string') {
			await interaction.reply({ content:obj.read, flags: 64 });
		}
		else if (typeof obj.read.type !== 'undefined' && obj.read.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.read.attr);
			await interaction.reply({ content: replyString || 'You can\'t do that.', flags: 64 });
		}
		else {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
		}
		await q.saveGame('./game.json', qgame);
	},
};