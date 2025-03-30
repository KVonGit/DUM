const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weigh')
		.setDescription('Weigh something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to weigh')
				.setRequired(true)),
	async execute(interaction) {
		const objectName = interaction.options.getString('object');
		if (!objectName) {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(objectName);

		if (!obj) {
			await q.msg(`No such object ("${objectName}")!`);
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (typeof obj.weight !== 'number') {
			await q.msg(q.GetDisplayName(obj, true, false, true).capFirst() + ' is not something you can weigh.');
			return;
		}
		let s = q.GetDisplayName(obj, true, false, true).capFirst() + ' weigh';
		s += obj.plural === true ? '' : 's';
		s += ' ' + obj.weight + ' grams.';
		await q.msg(s);
	},
};