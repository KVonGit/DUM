const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('use')
		.setDescription('Use something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to use')
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
		const obj = q.getObject(qgame, object);
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (typeof obj.use == 'undefined') {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
			return;
		}
		const thisAttr = q.getAttribute(obj.use);
		if (!thisAttr) {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
			return;
		}
		if (thisAttr.attr === true) {
			obj.loc = 'nowhere';
			await interaction.reply({ content: 'You use it, but nothing seems to happen.', flags: 64 });
		}
		else if (thisAttr.type == 'string') {
			await interaction.reply({ content:thisAttr.attr, flags: 64 });
		}
		else if (thisAttr.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (thisAttr.attr);
			await interaction.reply({ content: replyString || 'You can\'t do that.', flags: 64 });
		}
		else {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
		}
		await q.saveGame('./game.json', qgame);
	},
};