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
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		const obj = q.GetObject(object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, true, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (typeof obj.read == 'undefined') {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		else if (obj.read === true) {
			obj.loc = 'nowhere';
			await q.msg('You read for a while.');
		}
		else if (typeof obj.read == 'string') {
			await q.msg(obj.read);
		}
		else if (typeof obj.read.type !== 'undefined' && obj.read.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.read.attr);
			await q.msg(replyString || 'You can\'t do that.');
		}
		else {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};