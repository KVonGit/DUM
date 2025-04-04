const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const q = require('../../engine/q');
const { Octokit } = require('@octokit/rest');
const { githubToken } = require('../../config.json'); // Add your GitHub token to config.json

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
    auth: githubToken
});

// Constants for your GitHub repository
const REPO_OWNER = 'KVonGit'; // Your actual GitHub username
const REPO_NAME = 'DUM'; // Your repository name

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
                
            // Create a text input component for bug description
            const bugInput = new TextInputBuilder()
                .setCustomId('bugText')
                .setLabel('Describe the bug:')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Please describe what happened and what you expected to happen...')
                .setRequired(true);
                
            // Create a text input for bug title
            const titleInput = new TextInputBuilder()
                .setCustomId('bugTitle')
                .setLabel('Bug title:')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Brief description of the issue')
                .setRequired(true);
                
            // Add inputs to action rows
            const titleRow = new ActionRowBuilder().addComponents(titleInput);
            const descriptionRow = new ActionRowBuilder().addComponents(bugInput);
            
            // Add the action rows to the modal
            modal.addComponents(titleRow, descriptionRow);
            
            // Show the modal to the user
            await interaction.showModal(modal);
            
            // Wait for the modal response
            const filter = i => i.customId === 'bugReportModal' && i.user.id === interaction.user.id;
            
            try {
                const response = await interaction.awaitModalSubmit({ filter, time: 300000 }); // 5 minute timeout
                if (response) {
                    const description = response.fields.getTextInputValue('bugText');
                    const title = response.fields.getTextInputValue('bugTitle');
                    
                    // Create GitHub issue
                    try {
                        const issue = await octokit.issues.create({
                            owner: REPO_OWNER,
                            repo: REPO_NAME,
                            title: `[BUG] ${title}`,
                            body: `**Reported by:** ${alias} (${pov.name})\n\n**Description:**\n${description}\n\n**Reported via Discord on:** ${new Date().toISOString()}`
                        });
                        
                        // Send a confirmation to transcript
                        await q.msg(`Bug report submitted as GitHub issue #${issue.data.number}`);
                        await q.msg('>>> ' + description);
                        await response.reply({ 
                            content: `Bug report submitted successfully as GitHub issue #${issue.data.number}! View it here: ${issue.data.html_url}`, 
                            flags: 64 
                        });
                        
                        // Also send to Discord channel if desired
                        const bugReportChannel = interaction.client.channels.cache.find(channel => channel.name === 'bug-reports');
                        if (bugReportChannel) {
                            await bugReportChannel.send(
                                `**Bug Report**\nFrom: ${alias} (${pov.name})\nTitle: ${title}\nDescription: \n>>> ${description}\n\nCreated as GitHub issue #${issue.data.number}: ${issue.data.html_url}`
                            );
                        }
                    } catch (githubError) {
                        console.error('GitHub API error:', githubError);
                        
                        // Fall back to Discord-only reporting if GitHub fails
                        const bugReportChannel = interaction.client.channels.cache.find(channel => channel.name === 'bug-reports');
                        if (bugReportChannel) {
                            await bugReportChannel.send(`**Bug Report**\nFrom: ${alias} (${pov.name})\nTitle: ${title}\nDescription: \n>>> ${description}\n\n*Note: Failed to create GitHub issue.*`);
                            await q.msg('>>> ' + description);
                            await response.reply({ 
                                content: 'Bug report submitted to Discord channel only. GitHub issue creation failed.', 
                                flags: 64 
                            });
                        } else {
                            await q.msg('Bug report channel not found and GitHub issue creation failed. Please contact an admin.');
                            await response.reply({ 
                                content: 'Bug report failed - channel not found and GitHub issue creation failed.', 
                                flags: 64 
                            });
                        }
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