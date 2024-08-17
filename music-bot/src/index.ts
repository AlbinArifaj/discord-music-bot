
const {Collection,Client,Discord,GatewayIntentBits,IntentsBitField  }= require("discord.js")

const {REST} =require("@discordjs/rest")
const {Routes} =require("discord-api-types/v9")
const fs =require("fs")
const  {Player} =require("discord-player")
const {TOKEN,GUILD_ID,CLIENT_ID} = require("./config.json")

const LOAD_SLASH =process.argv[2] == "load"


const myIntents = new IntentsBitField();
myIntents.add(IntentsBitField.Flags.GuildMessages,IntentsBitField.Flags.GuildVoiceStates,IntentsBitField.Flags.Guilds);

const client = new Client({ intents:myIntents});

client.slashcommands = new Collection()

client.player = new Player(client,{
    ytdlOptions:{
        quality:"highestaudio",
        highWaterMark:1<<25
    }
})


client.player.extractors.loadDefault();

let commands:string[] =[]
const slashFiles =fs.readdirSync("./commands").filter(file=>file.endsWith(".ts"))
console.log(slashFiles)
for(const file of slashFiles){
    const slashCmd=require(`./commands/${slashFiles}`)
    client.slashcommands.set(slashCmd.data.name,slashCmd)
    if(LOAD_SLASH) commands.push(slashCmd.data.toJSON())
}

if(LOAD_SLASH){
const rest = new REST({ version: "9" }).setToken(TOKEN)
console.log("Deploying commands commands")
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}else{
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })



    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return
            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid commands command")
            await interaction.deferReply()
            await slashcmd.execute(client, interaction )
        }
        handleCommand()
    })




    client.login(TOKEN)
}