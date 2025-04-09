const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drop')
		.setDescription('Drop something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to drop')
				.setRequired(true)),
	aliases: ['discard', 'throw'],
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
		if (obj.loc !== pov.name) {
			await q.msg(q.template.dontHave(q.GetDisplayName(obj, false, false, true)));
			return;
		}

		let { type, attr } = q.getAttribute(obj, 'drop');

		if (!type) {
			type = 'boolean';
			attr = true;
		}

		if (type === 'boolean') {
			if (attr) {
				obj.loc = pov.loc;
				await q.msg(q.template.dropped);
			}
			else {
				await q.msg(q.template.cantDrop(q.GetDisplayName(obj, true, false, true)));
			}
		}
		else if (type === 'string') {
			await q.msg(attr);
		}
		else if (type === 'script') {
			const replyString = '';
			await eval(attr);
			await q.msg(replyString === '' ? 'No response from object attribute script.' : replyString);
			return;
		}
		else {
			obj.loc = pov.loc;
		}
	},
};