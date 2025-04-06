const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startgame')
        .setDescription('Join the game.'),
    async execute(interaction) {
        // Use global.qgame if already loaded, otherwise try loading from channel first
        let qgame = global.qgame;
        
        if (!qgame) {
            try {
                // First try to load from channel
                console.log('Attempting to load game data from Discord channel...');
                qgame = await q.loadGameFromChannel(undefined, interaction.client);
                
                if (!qgame) {
                    // If channel load fails, fall back to file
                    console.log('No game found in Discord channel, loading from file...');
                    qgame = await q.loadGameOnce('./game.yaml');
                }
            } catch (error) {
                console.error('Error loading game:', error);
                // Final fallback
                qgame = await q.loadGameOnce('./game.yaml');
            }
            
            global.qgame = qgame; // Update global state
        }
        
        const povName = interaction.user.username;
        const alias = interaction.member?.displayName || interaction.user.displayName || interaction.user.username;
        let pov = {};
        let s = '';

        if (Object.keys(qgame.players).indexOf(povName) < 0) {
            qgame.players[povName] = {
                'name': povName,
                'alias': alias,
                'id': interaction.user.id,
                'avatar': interaction.user.displayAvatarURL(),
                'userName': interaction.user.username,
                'dateJoined': Date.now(),
                'commandHistory': [],
                'objectPronoun': 'them',
                'lastObject': {},
            };
            pov = qgame.players[povName];
            // TODO: Allow the player to add their objectPronoun (default to "them"), a color for their transcipt entries' embeds, text when someone looks at them, text when someone speaks to them, text when someone attacks them, and if they want other players to be able to GIVE them items or not. All are optional.

            if (typeof pov.loc === 'undefined') {
                pov.loc = qgame.game.startingLocation || 'Lounge';
            }

            if (typeof qgame.joinScript !== 'undefined') {
                s += qgame.joinScript(povName) || '';
            }
            else {
                s += `Welcome, ${alias}!\n\n`;
            }

            if (typeof qgame.startScript !== 'undefined') {
                qgame.startScript();
            }

            s += q.getLocationDescription(qgame, pov);
            await interaction.reply({ content: `${alias} has joined the game!` });
            await q.addToTranscriptChannel(`${alias} has joined the game!`);
            await interaction.followUp({ content: s, flags: 64 });

            try {
                // Save using the YAML format
                await q.saveGame('./game.yaml', qgame);
            }
            catch (err) {
                console.error('Error saving game data:', err);
                await interaction.reply({ content: 'Failed to save game data.', flags: 64 });
            }
        }
        else {
            await interaction.reply({ content: 'You are already playing the game.', flags: 64 });
        }
    },
};