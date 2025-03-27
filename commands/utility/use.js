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
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj)));
			return;
		}
		if (typeof obj.use == 'undefined') {
			const s = 'You can\'t do that.';
			await q.msg(s);
			return;
		}
		const thisAttr = q.getAttribute(obj.use);
		if (!thisAttr) {
			const s = 'You can\'t do that.';
			await q.msg(s);
			return;
		}
		if (thisAttr.attr === true) {
			obj.loc = 'nowhere';
			await q.msg('You use it, but nothing seems to happen.');
		}
		else if (thisAttr.type == 'string') {
			await q.msg(thisAttr.attr);
		}
		else if (thisAttr.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (thisAttr.attr);
			await q.msg(replyString || 'You can\'t do that.');
		}
		else {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};