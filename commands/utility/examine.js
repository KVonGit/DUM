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
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await q.msg(q.template.cantSee(obj.alias || obj.name));
		}
		else if (typeof obj.look == 'undefined') {
			const s = q.template.defaultLook;
			await q.msg(s);
		}
		else if (typeof obj.look == 'string') {
			await q.msg(obj.look);
		}
		else if (typeof obj.look.type !== 'undefined' && obj.look.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.look.attr);
			await q.msg(replyString || q.defaultLook);
		}
		else {
			const s = q.template.defaultLook;
			await q.msg(s);
		}
		if (typeof obj.switchedOn != 'undefined') {
			if (obj.switchedOn && typeof obj.switchedondesc == 'string') {
				await q.msg(obj.switchedondesc, true, true);
			}
			else if (!obj.switchedOn && obj.switchedoffdesc == 'string') {
				await q.msg(obj.switchedoffdesc, true, true);
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
			n += q.GetDisplayName(obj).replace(/^a /, 'the ') + ', you see ';
			if (obj.inherit.indexOf('container') >= 0 && (obj.isOpen === false && !obj.transparent)) {
				return;
			}
			else if (children.length > 0) {
				// console.log('children:', children);

				if (typeof obj.listchildrenprefix === 'string') {
					n = obj.listchildrenprefix;
				}
				n += q.GetDirectChildrenAsString(obj);
				await q.msg(n, true, true);
			}
		}
	},
};