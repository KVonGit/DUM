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
	aliases: ['lookat', 'x'],
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);;
		if (typeof obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		const pro = obj.objectPronoun || 'it';
		pov.lastObject[pro] = obj.name;
		if (!q.inScope(obj)) {
			// console.log('q.inScope("' + obj.name + '")', q.inScope(obj));
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		
		if (typeof obj.look == 'undefined') {
			const s = q.template.defaultLook;
			await q.msg(s);
			return;
		}

		const { type, attr } = q.getAttribute(obj, 'look');
		if (typeof type == 'undefined') {
			const s = q.template.defaultLook;
			await q.msg(s);
		}
		else if (type == 'string') {
			await q.msg(obj.look);
		}
		else if (type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (attr);
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
			n += q.GetDisplayName(obj).replace(/^a /, 'the ') + ', you see';
			if (obj.inherit.indexOf('container') >= 0 && (obj.isOpen === false && !obj.transparent)) {
				return;
			}
			else if (children.length > 0) {
				// console.log('children:', children);

				if (typeof obj.listchildrenprefix === 'string') {
					n = obj.listchildrenprefix;
				}
				n += ' ' + q.GetDirectChildrenAsString(obj) + '.';
				await q.msg(n, true, true);
			}
		}
	},
};