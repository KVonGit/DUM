const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('revive')
		.setDescription('Revive someone!')
		.addStringOption(option =>
			option.setName('npc')
				.setDescription('The npc you wish to which you wish to speak')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
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
		if (obj.loc !== pov.loc && obj.loc !== pov.name) {
			await q.msg(q.template.cantSee(obj.name));
			return;
		}
		if (obj.name !== 'Bob') {
			await q.msg(`You can't revive ${q.GetDisplayName(obj)}.`);
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
