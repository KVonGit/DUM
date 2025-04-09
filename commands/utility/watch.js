const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watch')
		.setDescription('Watch something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to watch')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}

		pov.lastObject[obj.objectPronoun] = obj.name;
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		
		if (typeof obj.watch == 'undefined') {
			const s = `You can't watch ${q.GetDisplayName(obj, true, false, true)}.`;
			await q.msg(s);
		}
		else if (typeof obj.watch == 'string') {
			await q.msg(obj.watch);
		}
		else if (typeof obj.watch.type !== 'undefined' && obj.watch.type == 'script') {
			let qOutput;
			await eval (obj.watch.attr);
			await q.msg(qOutput || `You can't watch ${q.GetDisplayName(obj, true, false, true)}.`);
		}
		else {
			const s = `You can't watch ${q.GetDisplayName(obj, true, false, true)}.`;
			await q.msg(s);
		}
	},
};