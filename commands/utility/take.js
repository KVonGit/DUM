const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Take something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to take')),
	async execute(interaction) {
		const objectName = interaction.options.getString('object');
		if (!objectName) {
			await interaction.reply({ content: '\'object\' not defined.', flags: 64 });
			return;
		}

		const qgame = await q.loadGame('./game.json', interaction);
		const pov = qgame.players[interaction.user.username];
		const obj = q.getObject(qgame, objectName);

		if (!obj) {
			await interaction.reply({ content: `No such object ("${objectName}")!`, flags: 64 });
			return;
		}

		if (obj.loc === pov.name) {
			await interaction.reply({ content: q.template.alreadyHave(obj.name), flags: 64 });
			return;
		}

		let wasTaken = false;
		// TODO: Handle scope!

		// Handle object-specific take logic
		if (obj.takescript) {
			eval(obj.takescript);
			wasTaken = obj.loc === pov.name;
		}
		else if (obj.take === true) {
			obj.loc = pov.name;
			wasTaken = true;
		}
		else if (obj.take?.type) {
			switch (obj.take.type) {
			case 'string':
				await interaction.reply({ content: obj.take.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj.take.attr) {
					obj.loc = pov.name;
					wasTaken = true;
				}
				else {
					await interaction.reply({ content: q.template.cantTake(obj.name), flags: 64 });
				}
				break;
			case 'script':
				eval(obj.take.attr);
				wasTaken = obj.loc === pov.name;
				break;
			default:
				await interaction.reply({ content: q.template.cantTake(obj.name), flags: 64 });
				break;
			}
		}
		else {
			await interaction.reply({ content: q.template.cantTake(obj.name), flags: 64 });
		}

		// Handle successful take
		if (wasTaken) {
			await interaction.reply(`${pov.alias} took ${obj.name}.`);
			const successMessage = obj.takemsg || q.template.taken;
			await interaction.followUp({ content: successMessage, flags: 64 });

			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
	},
};