const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-terms-adminonly')
        .setDescription('Creates the terms and conditions agreement button')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel to send the terms agreement to')
                .setRequired(true)),
    
    async execute(interaction) {
		if (interaction.user.id !== interaction.guild.ownerId) {
			return await interaction.reply({ content: "You don't have permission to use this command!", flags: 64 });
		}
        const channel = interaction.options.getChannel('channel');
        
        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('Terms and Conditions')
            .setDescription(
                'Before participating in this game, please read and agree to the following:\n\n' +
                '1. Be respectful to all other players\n' +
                '2. Follow the Discord Community Guidelines\n' +
                '3. Keep discussions appropriate for all ages\n' +
                '4. Have fun!\n\n' +
                'By clicking the button below, you agree to follow these rules and gain access to the game channels.'
            )
            .setFooter({ text: 'Click the button below to agree' });
            
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('agree-terms')
                    .setLabel('I Agree to the Terms')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );
            
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Terms and conditions message created!', flags: 64 });
    }
};