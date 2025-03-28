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
		const objectName = interaction.options.getString('npc');
		if (!objectName) {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, objectName);

		if (!obj) {
			await q.msg(`No such object ("${objectName}")!`);
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(obj.name));
			return;
		}
		if (typeof obj.weight !== 'number') {
			await q.msg(q.GetDisplayName(obj, true) + ' is not something you can weigh.');
			return;
		}
		let s = q.GetDisplayName(obj, true) + ' weigh';
		s += obj.plural !== true ? '' : 's';
		s += ' ' + obj.weight + '.';
		await q.msg(s);

	},
};