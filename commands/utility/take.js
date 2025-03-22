const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Take something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to take')),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const pov = qgame[interaction.user.username];
		const obj = qgame[object];
		// TODO - Check the object parent first!
		if (obj.parent == pov.name) {
			await interaction.reply({ content: core.template.alreadyHave(obj.name), flags: 64 });
			return 0;
		}
		else if (obj.parent != pov.parent) {
			if (typeof qgame[obj.parent].parent != 'undefined') {
				if (qgame[obj.parent].parent == pov.parent) {
					// another player has it, or it's in or on something
					if (typeof qgame[obj.parent].type != 'undefined') {
						// it's a surface or container
						if (qgame[obj.parent].type == 'surface') {
							// able to take, just let things roll
						}
						else if (qgame[obj.parent].type == 'container') {
							// is it closed?
							if (qgame[obj.parent].closed) {
								if (obj.parent.transparent) {
									// TODO - you can't it's closed
								}
								else {
									// TODO - can't see that!
								}
							}
							// if it's not closed, just let things roll
						}
						else {
							// TODO - error!
						}
					}
					else {
						// probably another player
						const s = `${obj.parent} probably wouldn't like that.`;
						await interaction.reply({ content: s, flags: 64 });
						return 0;
					}
				}
			}
			await interaction.reply({ content: core.template.cantSee(obj.name), flags: 64 });
			return 0;
		}
		let qtook = false;
		switch (typeof obj.take) {
		case 'undefined':
			// definitely not
			await interaction.reply({ content: object + ' has no take property!', flags: 64 });
			break;
		case 'string':
			// nope
			await interaction.reply({ content: obj.take, flags: 64 });
			break;
		case 'boolean':
			if (obj.take) {
				// get it!
				qtook = true;
				obj.parent = pov.name;
			}
			else {
				// can't get it!
				await interaction.reply({ content: core.template.cantTake(obj.name), flags: 64 });
			}
			break;
		case 'function':
			// call function
			qtook = obj.take();
			break;
		}
		if (qtook) {
			// tell everybody!
			await interaction.reply(`${pov.name} took ${object}.`);
			// need to return something if take is a function, to know if it printed something!
			await interaction.followUp({ content: core.template.taken, flags: 64 });
			try {
				await core.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			return 0;
		}
	},
};