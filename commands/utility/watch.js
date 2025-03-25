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
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}

		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(obj.alias || obj.name), flags: 64 });
		}
		else if (typeof obj.watch == 'undefined') {
			const s = `You can't watch ${(obj.prefix ? obj.prefix + ' ' : '') + (obj.alias || obj.name)}.`;
			await interaction.reply({ content: s, flags: 64 });
		}
		else if (typeof obj.watch == 'string') {
			await interaction.reply({ content:obj.watch, flags: 64 });
		}
		else if (typeof obj.watch.type !== 'undefined' && obj.watch.type == 'script') {
			let qOutput;
			await eval (obj.watch.attr);
			await interaction.reply({ content: qOutput || `You can't watch ${(obj.prefix ? obj.prefix + ' ' : '') + (obj.alias || obj.name)}.`, flags: 64 });
		}
		else {
			const s = `You can't watch ${(obj.prefix ? obj.prefix + ' ' : '') + (obj.alias || obj.name)}.`;
			await interaction.reply({ content: s, flags: 64 });
		}
	},
};