const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('examine')
		.setDescription('Examine something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to examine')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(obj.alias || obj.name), flags: 64 });
		}
		else if (typeof obj.look == 'undefined') {
			const s = q.template.defaultLook;
			await interaction.reply({ content: s, flags: 64 });
		}
		else if (typeof obj.look == 'string') {
			await interaction.reply({ content:obj.look, flags: 64 });
		}
		else if (typeof obj.look.type !== 'undefined' && obj.look.type == 'script') {
			let replyString;
			await eval (obj.look.attr);
			await interaction.reply({ content: replyString || q.defaultLook, flags: 64 });
		}
		else {
			const s = q.template.defaultLook;
			await interaction.reply({ content: s, flags: 64 });
		}
		if (typeof obj.switchedOn != 'undefined') {
			if (obj.switchedOn && typeof obj.switchedondesc == 'string') {
				await interaction.followUp({ content: obj.switchedondesc, flags: 64 });
			}
			else if (!obj.switchedOn && obj.switchedoffdesc == 'string') {
				await interaction.followUp({ content: obj.switchedoffdesc, flags: 64 });
			}
		}
		// TODO: Also check for listChildren for surfaces/containers that are isOpen
		if (obj.listChildren) {
			// console.log('obj says listChildren:', obj);
			// Get the direct children of the object
			const children = q.GetDirectChildren(obj);
			// console.log('children:', children);

			// If there are children, list them
			let n = obj.inherit.indexOf('surface') >= 0 ? 'On ' : 'In ';
			n += q.GetDisplayName(obj) + ', you see ';
			if (obj.inherit.indexOf('container') >= 0 && (obj.isOpen === false && !obj.transparent)) {
				return;
			}
			else if (children.length > 0) {
				// console.log('children:', children);

				if (typeof obj.listchildrenprefix === 'string') {
					n = obj.listchildrenprefix;
				}
				n += q.GetDirectChildrenAsString(obj);
			}
			await q.msg(n, true, true);
		}
	},
};