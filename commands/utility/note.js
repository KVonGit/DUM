const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Make a note, for the transcript.'),
    async execute(interaction) {
        global.interaction = interaction;
        const alias = pov.alias;
        
        if (Object.keys(qgame.players).indexOf(pov.name) > -1) {
            // Check if this is a text command or slash command
            if (interaction.isTextCommand) {
                // Handle text command (from patterns.js matching)
                const text = interaction.options.getString('text');
                if (text) {
                    await q.msg('>>> ' + text);
                    await interaction.reply('Note added to transcript!');
                } else {
                    await interaction.reply('You need to provide text for your note!');
                }
                return;
            }
            
            // This is a slash command - show modal
            try {
                // Create a modal for the note input
                const modal = new ModalBuilder()
                    .setCustomId('noteModal')
                    .setTitle('Add a Note');
                    
                // Create a text input component
                const noteInput = new TextInputBuilder()
                    .setCustomId('noteText')
                    .setLabel('Your note:')
                    .setStyle(TextInputStyle.Paragraph) // Allows multiple lines
                    .setPlaceholder('Type your note here...')
                    .setRequired(true);
                    
                // Add the text input to an action row
                const firstActionRow = new ActionRowBuilder().addComponents(noteInput);
                
                // Add the action row to the modal
                modal.addComponents(firstActionRow);
                
                // Show the modal to the user
                await interaction.showModal(modal);
                
                // Wait for the modal response
                const filter = i => i.customId === 'noteModal' && i.user.id === interaction.user.id;
                
                try {
                    const response = await interaction.awaitModalSubmit({ filter, time: 300000 }); // 5 minute timeout
                    if (response) {
                        const description = response.fields.getTextInputValue('noteText');
                        await q.msg('>>> ' + description);
                        await response.reply({ content: 'Note added to transcript!', flags: 64 });
                    }
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error with the note command.', ephemeral: true });
            }
        }
        else {
            await q.msg(template.notPlaying);
        }
    },
};