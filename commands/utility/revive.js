const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('revive')
		.setDescription('Revive someone!')
		.addStringOption(option =>
			option.setName('npc')
				.setDescription('The npc you wish to revive')
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
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (obj.name !== 'Bob') {
			await q.msg(`You can't revive ${q.GetDisplayName(obj, true, false, true)}.`);
			return;
		}
		if (q.GetObject('defibrillator').loc !== pov.name) {
			await q.msg('You don\'t have a way to do that!');
			return;
		}
		// console.log('Reviving Bob...');
		global.pov = pov;
		await q.reviveBobProc();
	},
};
