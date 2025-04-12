const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('watch')
        .setDescription('Watch something')
        .addStringOption(option =>
            option.setName('object')
                .setDescription('What you want to watch')
                .setRequired(true)),
    async execute(interaction) {
        const objectName = interaction.options.getString('object');
        const obj = q.GetObject(objectName);
        
        if (!obj) {
            await interaction.reply({ content: `You don't see any "${objectName}" here.`, flags: 64 });
            return;
        }
        
        if (obj.name === 'TV' || obj.name === 'television') {
            // Initial TV display
            const tvFrame = `
\`\`\`
┌───────────────────────────────────────────────────┐
│                TEXT ADVENTURE                     │
│                 TELEVISION                        │
│                                                   │
│  "Please stand by..."                             │
│                                                   │
└───────────────────────────────────────────────────┘
\`\`\``;
            
            const response = await interaction.reply({ content: tvFrame});
            
            // Array of TV shows to cycle through
            const shows = [
                `"You are likely to be eaten by a grue"`,
                `"It is dark. You are likely to be eaten by a grue."`,
                `"I see no lamp here"`,
                `"You have died of dysentery"`,
                `"You are in a maze of twisty little passages, all alike"`,
                `"XYZZY"`,
                `"Plugh"`
            ];
            
            // Simulate changing channels
            let currentShow = 0;
            
            // Function to update the TV content
            const updateTV = async () => {
                const newContent = `
\`\`\`
┌───────────────────────────────────────────────────┐
│                TEXT ADVENTURE                     │
│                 TELEVISION                        │
│                                                   │
│  ${shows[currentShow].padEnd(49)} │
│                                                   │
└───────────────────────────────────────────────────┘
\`\`\``;
                
                await interaction.editReply(newContent);
                
                currentShow = (currentShow + 1) % shows.length;
                
                // Continue for a few changes, then stop
                if (tvIntervals.length < 8) {
                    tvIntervals.push(setTimeout(updateTV, 1500));
                }
            };
            
            // Store intervals so we can clear them if needed
            const tvIntervals = [];
            tvIntervals.push(setTimeout(updateTV, 1500));
            
            // Additional message about watching
            setTimeout(() => {
                interaction.followUp({ 
                    content: `You watch the TV for a while. These classic text adventure shows really bring back memories!`, 
                    flags: 64 
                });
            }, 3000);
        } else {
            // Handle watching other objects
            await interaction.reply({ content: `You watch the ${obj.name} intently, but nothing happens.`, flags: 64 });
        }
    },
};