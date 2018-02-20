const Discord = module.require('discord.js');
const fs = module.require("fs");


module.exports.run = async (bot, message, args) => {
    //get the mentioned user, return if there is none.
    //check if command executor has the right permission to do this command.
    //if the mute has the samer or a righer role than the muter return.
    
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("You do not have manage message permission");
    //if(message.channel.permissionsFor(message.member).hasPermission("MANAGE_MESSAGES");
    var toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args);

    if(toMute.id == message.author.id) return message.channel.sendMessage("You cannot mute yourself.");
    if(toMute.highestRole.position >= message.member.highestRole.position) return ;

    if(!toMute) return message.channel.send("You did not specify a user mention or ID!");
        //trata os dois casos, no primeiro que retorna um user
        //trata o segundo caso também que retorna um guildMember.
        //return message.reply(toMute.username || toMute.user.username);
        //verifica antes de criar a role novamente se ela já existe.
        let role = message.guild.roles.find(r => r.name == "WAWA MUTOU");
        if(!role){
            try {
                role = await message.guild.createRole({
                    name: "WAWA MUTOU",
                    color: "#000000",
                    permissions: []
                });
                //map function in collections, a loop to move arround all 
                message.guild.channels.forEach(async( channel,id) => {
                    await channel.overwritePermissions(role , {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            }catch(e){
                console.log(e.stack);
            }
        }
    //if already has the role, do nothing.
    if(toMute.roles.has(role.id)) return message.channel.sendMessage("this user is already muted!");
    await(toMute.addRole(role));
    message.channel.sendMessage("i have muted them");
    
    bot.mutes[toMute.id] = {
        guild: message.guild.id,
        time: Date.now() + parseInt(args[1]) * 1000
    }

    fs.writeFile("./mutes.json", JSON.stringify(bot.mutes, null, 4), err=>{
        if (err) throw err;
        message.channel.send("I have muted this user!");
    });

    return ;
}


module.exports.help = {
    name: "mute"
}