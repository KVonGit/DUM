const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('siton')
		.setDescription('Sit on something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object on which you wish to sit')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		if (Object.keys(qgame.players).indexOf(pov.name) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		const obj = q.GetObject(object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (typeof obj.sit == 'undefined') {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		else if (obj.sit === true) {
			obj.loc = 'nowhere';
			await q.msg('You sit for a while.');
		}
		else if (typeof obj.sit == 'string') {
			await q.msg(obj.sit);
		}
		else if (typeof obj.sit.type !== 'undefined' && obj.sit.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.sit.attr);
			await q.msg(replyString || 'You can\'t do that.');
		}
		else {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
	},
};