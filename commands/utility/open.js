const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Open something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to open')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const object = interaction.options.getString('object');
		if (!object) {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);
		// Check if the object exists
		if (!obj) {
			await interaction.reply({ content: `No such object ("${object}")!`, flags: 64 });
			return;
		}

		// Check if the object is visible to the player
		if ((obj.loc !== pov.loc && obj.loc !== pov.name) || obj.visible === false) {
			await interaction.reply({ content: q.template.cantSee(q.GetDisplayName(obj)), flags: 64 });
			return;
		}

		// Check if the object is already open
		if (obj.isOpen === true) {
			await interaction.reply({ content: q.template.alreadyOpen(q.GetDisplayName(obj)), flags: 64 });
			return;
		}

		// Handle objects that can be opened
		if (obj.open === true || (obj.inherit && obj.inherit.indexOf('openable') >= 0)) {
			obj.isOpen = true;

			// Send the appropriate open message
			if (typeof obj.openMsg === 'string') {
				await interaction.reply({ content: obj.openMsg, flags: 64 });
			}
			else {
				let prefix = obj.prefix || '';
				if (obj.prefix && obj.prefix === 'a') prefix = 'the';
				if (prefix !== '') prefix += ' ';
				const name = obj.alias || obj.name;
				const displayName = prefix + name;
				await interaction.reply({ content: q.template.defaultOpen(displayName), flags: 64 });
			}

			// Send any follow-up messages
			if (typeof obj.afterOpeningMsg === 'string') {
				await interaction.followUp({ content: obj.afterOpeningMsg, flags: 64 });
			}

			// Execute any scripts after opening
			if (obj.afterOpening) {
				try {
					await eval(obj.afterOpening);
				}
				catch (err) {
					console.error(`Error in ${obj.name} afterOpening script:`, err);
					await interaction.followUp({ content: 'Error in afterOpening script.', flags: 64 });
				}
			}

			// List children if applicable
			if (obj.listChildren) {
				const children = q.GetDirectChildren(obj);
				if (children.length > 0) {
					let n = obj.inherit.indexOf('surface') >= 0 ? 'On ' : 'In ';
					n += q.GetDisplayName(obj).replace(/^a /, 'the ') + ', you see ';
					if (typeof obj.listchildrenprefix === 'string') {
						n = obj.listchildrenprefix;
					}
					n += q.GetDirectChildrenAsString(obj);
					await q.msg(n, true, true);
				}
			}

			// Save the game state
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
			return;
		}

		// If the object cannot be opened
		let prefix = obj.prefix || '';
		if (obj.prefix && obj.prefix === 'a') prefix = 'the';
		if (prefix !== '') prefix += ' ';
		const name = obj.alias || obj.name;
		const displayName = prefix + name;
		await interaction.reply({ content: q.template.cantOpenOrClose(displayName), flags: 64 });
	},
};