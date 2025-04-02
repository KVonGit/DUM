const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reportbug')
        .setDescription('Report a bug in the game.'),
    aliases: ['bug', 'bugreport'],
    async execute(interaction) {
        global.interaction = interaction;
        const alias = pov.alias;
        
        if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
            // Create a modal for the bug report input
            const modal = new ModalBuilder()
                .setCustomId('bugReportModal')
                .setTitle('Report a Bug');
                
            // Create a text input component
            const bugInput = new TextInputBuilder()
                .setCustomId('bugText')
                .setLabel('Describe the bug:')
                .setStyle(TextInputStyle.Paragraph) // Allows multiple lines
                .setPlaceholder('Please describe what happened and what you expected to happen...')
                .setRequired(true);
                
            // Add the text input to an action row
            const firstActionRow = new ActionRowBuilder().addComponents(bugInput);
            
            // Add the action row to the modal
            modal.addComponents(firstActionRow);
            
            // Show the modal to the user
            await interaction.showModal(modal);
            
            // Wait for the modal response
            const filter = i => i.customId === 'bugReportModal' && i.user.id === interaction.user.id;
            
            try {
                const response = await interaction.awaitModalSubmit({ filter, time: 300000 }); // 5 minute timeout
                if (response) {
                    const description = response.fields.getTextInputValue('bugText');
                    
                    // Send to bug report channel
                    const bugReportChannel = interaction.client.channels.cache.find(channel => channel.name === 'bug-reports');
                    if (bugReportChannel) {
                        await bugReportChannel.send(`**Bug Report**\nFrom: ${alias} (${pov.name})\nDescription: \n>>> ${description}`);
                        // Send a confirmation to transcript
                        await q.msg('>>> ' + description);
                        await response.reply({ content: 'Bug report submitted successfully!', flags: 64 });
                    } else {
                        await q.msg('Bug report channel not found. Please contact an admin.');
                        await response.reply({ content: 'Bug report failed - channel not found.', flags: 64 });
                    }
                }
            } catch (error) {
                console.error(error);
                await q.msg('Error submitting bug report. Please try again later.');
            }
        }
        else {
            await q.msg(template.notPlaying);
        }
    },
};