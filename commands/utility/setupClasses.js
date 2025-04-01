const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-classes-adminonly')
        .setDescription('Creates the class selection dropdown')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel to send the class selector to')
                .setRequired(true)),
    
    async execute(interaction) {
		console.log('DUM-Admin setting up class selector..');
		if (interaction.user.id !== interaction.guild.ownerId) {
			return await interaction.reply({ content: "You don't have permission to use this command!", flags: 64 });
		}
        const channel = interaction.options.getChannel('channel');
        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Choose Your Class')
            .setDescription('Select your character class from the dropdown menu below!')
            .addFields(
                { name: 'Adventurer 🧭', value: 'Jack of all trades, master of none. Balanced stats and versatile abilities.' },
                { name: 'Guardian 🤺', value: 'Tank class with high defense. Protects allies and controls the battlefield.' },
                { name: 'Magic Wielder 🧙', value: 'Powerful spellcaster with devastating area attacks but lower defense.' }
            )
            .setFooter({ text: 'You can change your class at any time' });
            
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('class-selector')
                    .setPlaceholder('Select your class')
                    .setMinValues(0)
                    .setMaxValues(1)
                    .addOptions([
                        {
							label: 'Adventurer',
							description: 'Balanced and versatile',
							value: 'Adventurer',
							emoji: '🧭'  // or ⚔️ 🧗
						},
                        {
                            label: 'Guardian',
                            description: 'High defense, battlefield control',
                            value: 'Guardian',
                            emoji: '🤺'
                        },
                        {
                            label: 'Magic Wielder',
                            description: 'Powerful spells, lower defense',
                            value: 'Magic wielder',
                            emoji: '🧙'
                        }
                    ])
            );
            
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Class selector created!', flags: 64 });
    }
};