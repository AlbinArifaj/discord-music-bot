const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed}= require("discord.js")
const { EmbedBuilder } = require('discord.js');
const {QueryType} = require("discord-player")

module.exports={
    data:new SlashCommandBuilder()
        .setName("play")
        .setDescription("load songs")
        .addSubcommand(subcommand =>
            subcommand.setName("song")
                .setDescription("load single song from")
                .addStringOption((option)=>
                                        option.setName("url")
                                            .setDescription("The song's url")
                                            .setRequired(true)
                )
        )
    .addSubcommand((subcommand) =>
         subcommand
            .setName("search")
            .setDescription("searchsong")
            .addStringOption(option =>
                 option
                    .setName("searchterms")
                    .setDescription("searchsong")
                    .setRequired(true)
            )
    ),

    async execute (client,interaction){
        if(!interaction.member.voice.channel)
            return interaction.editReply("You need to be in VC")

        if(interaction.options.getSubcommand() === "song"){
            let url =interaction.options.getString("url")

            const result = await client.player.search(url,{
                requestedBy:interaction.user,
                searchEngine:QueryType.AUTO
            })


            try {
                const { track } = await client.player.play(interaction.member.voice.channel, result.tracks[0]);
                console.log(`🎉 I am playing ${track.title} 🎉`);
                interaction.editReply("Playing")
            } catch(e) {
                console.log(`😭 Failed to play error oh no:\n\n${e}`);
            }



        } else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            console.log(result)

            try {
                const { track } = await client.player.play(interaction.member.voice.channel, result.tracks[0],{
                    nodeOptions:{
                        metadata:interaction
                    }
                });
                const exampleEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(track.title)
                    .setURL(track.url)
                    .setThumbnail(track.thumbnail)
                await interaction.editReply({ embeds: [exampleEmbed] });
            } catch(e) {
                console.log(`😭 Failed to play error oh no:\n\n${e}`);
            }


        }


    }

}