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
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const objectName = interaction.options.getString('npc');
		if (!objectName) {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}
		const pov = qgame.players[interaction.user.username];
		const obj = q.getObject(qgame, objectName);

		if (!obj) {
			await interaction.reply({ content: `No such object ("${objectName}")!`, flags: 64 });
			return;
		}
		if (obj.loc !== pov.loc && obj.loc !== pov.name) {
			await interaction.reply({ content: q.template.cantSee(obj.name), flags: 64 });
			return;
		}
		if (obj.name !== 'Bob') {
			await interaction.reply({ content: `You can't revive ${q.GetDisplayName(obj)}.`, flags: 64 });
			return;
		}
		if (q.GetObject('defibrillator').loc !== pov.name) {
			await interaction.reply({ content: 'You don\'t have a way to do that!', flags: 64 });
			return;
		}
		console.log('Reviving Bob...');
		global.pov = pov;
		await q.reviveBobProc();
	},
};
