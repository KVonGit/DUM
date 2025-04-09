const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearchannel-adminonly')
        .setDescription('Clears all messages in the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (default: 100)')
                .setRequired(false)
        ),
    async execute(interaction) {
        console.log('DUM-Admin clearing channel..');
        const channel = interaction.channel;
        let amount = interaction.options.getInteger('amount') || 100;

        // Defer reply with ephemeral flag
        await interaction.deferReply({ flags: 64 });

        // Check permissions (use return to exit early)
        if (interaction.user.id !== channel.guild.ownerId) {
            return await interaction.editReply({ content: "You don't have permission to use this command!" });
        }
        
        if (!channel) {
            return await interaction.editReply({ content: "I can't find this channel!" });
        }

        if (!channel.permissionsFor(interaction.client.user).has('ManageMessages')) {
            return await interaction.editReply({ content: "I don't have permission to delete messages!" });
        }

        try {
            let deleted;
            let totalDeleted = 0;
            
            do {
                deleted = await channel.bulkDelete(Math.min(amount, 100), true);
                totalDeleted += deleted.size;
                amount -= deleted.size;
            } while (deleted.size > 0 && amount > 0);

            // Edit the deferred reply with success message
            await interaction.editReply({ content: `Cleared ${totalDeleted} messages.` });
            
            // Delete the reply after a short delay
            setTimeout(async () => {
                try {
                    // Try to delete the reply
                    await interaction.deleteReply();
                } catch (err) {
                    console.error('Error deleting reply:', err);
                }
            }, 500); // 500ms delay
            
            return;
        } catch (error) {
            console.error(error);
            return await interaction.editReply({ content: "Failed to delete messages." });
        }
    }
};
