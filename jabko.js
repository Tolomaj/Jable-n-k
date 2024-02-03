const {EmbedBuilder , Events, Client, GatewayIntentBits } = require('discord.js');
const { getAudioUrl } = require('google-tts-api');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { exec } = require("child_process");
const client = new Client({intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

var connection = null;
var jabkovateID =-1; // id uživatele kdo jablkuje
var lastConectionData = null;

client.on('ready', () => {

    //exec('"/eSpeak/command_line/espeak" hi')


    console.log('I am ready!');
});

async function changeNickName(guild,nickname) {
    var botMember = await guild.members.fetch(client.user.id);
    botMember.setNickname(nickname);
};


function odpoj(guild){
    changeNickName(guild,"Jablečník🍏");  
    if(connection != null){
        connection.destroy();
        connection = null;
    }
    jabkovateID = -1;
}

async function play(){
    connection=await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
        if(connection.status===VoiceConnectionStatus.Connected){
            connection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }
} 

client.on('messageCreate', async (message) => {
    if (message.content == "!strudl") {
        odpoj(message.guild);
        message.reply("Už teču.😉");
    };
    if (message.content == "!most") {
        connection = joinVoiceChannel(lastConectionData);
        message.reply("😉");
    };
    if (message.content == "!cider") {
        const audioURL = await getAudioUrl("helo from hell", {
          lang: 'cs',
          slow: false,
          host: 'https://translate.google.com',
          timeout: 10000,
        });
        console.log(audioURL);
        //let VoiceConnection = joinVoiceChannel({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
        const resource = createAudioResource(audioURL);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
    };
});



client.on('voiceStateUpdate', (oldMember, newMember) => {

    if(newMember.channelId == null){
        if(newMember.member.user.id == client.user.id){ // bot odpojen rukou
            odpoj(newMember.guild);  
        }
        if(newMember.member.user.id == jabkovateID && connection != null){ // odpojil se člověk z afk
            odpoj(newMember.guild); 
        }
        return; 
    }

    if(newMember.member.user.id == jabkovateID && connection != null && newMember.channelId != null){ // člověk se připojil zpět ale do jineho chanelu
        odpoj(newMember.guild);
    }

    if(oldMember.channelId == null || oldMember.guild.afkChannelId == null || oldMember.member.user.id == client.user.id){ // prevent null (meand the user is joining without been in room before)
        //console.log("returning");
        return;
    }

    if(newMember.guild.afkChannelId == newMember.channelId){ // uživatel se připojil do afk kanálu.
        lastConectionData = { channelId: oldMember.channelId, guildId: newMember.guild.id, adapterCreator: newMember.guild.voiceAdapterCreator,selfDeaf: false,selfMute: false};
        connection = joinVoiceChannel(lastConectionData);
        jabkovateID = oldMember.member.user.id;
        var nickname = oldMember.member.nickname;
        if (nickname == null) {
            nickname = oldMember.member.user.username;
        }

        console.log(nickname);
        changeNickName(newMember.guild,nickname);
        console.log(nickname);
        var message = nickname + " zjablečněl."

        const audioURL = getAudioUrl(message, {
          lang: 'cs',
          slow: false,
          host: 'https://translate.google.com',
          timeout: 10000,
        });
        console.log(audioURL);
        //let VoiceConnection = joinVoiceChannel({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
        const resource = createAudioResource(audioURL);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        console.log("mos");
    }

  })
client.login('----');