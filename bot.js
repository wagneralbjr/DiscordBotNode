//imports
const botSettings = require("./botsettings.json"); // use ./ to acess files of the same folder.
const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");

const prefix = botSettings.prefix;

const  bot = new Discord.Client({disableEveryone: true});

bot.mutes = require("./mutes.json");

bot.commands = new Discord.Collection();

fs.readdir("./cmds/", (err,files) => {
    if (err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0 ){
        console.log("No commands to load!");
        return;
    }

    console.log(`loading ${jsfiles.length} commands!`);

    jsfiles.forEach(( f,i) => {
        let props = require(`./cmds/${f}`); // aqui carrega as funções. certo?
        console.log(`${i + 1} : ${f} loaded!`); // mostra os arquivos que meio q carregou.
        bot.commands.set(props.help.name,props); // cria um mapa, com nome do "comando", e a função em Si.

    });
});

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "discordbot"
});

con.connect(err => {
    if (err) throw err;
    console.log("connected to the database!");
    //con.query("SHOW TABLES", console.log);
});

function generateXp() {
    let min = 10;
    let max = 30;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

bot.on("ready", async () => {
    console.log("Bot is ready! " + bot.user.username);
   
    //the way to add the bot to the server.
    bot.generateInvite(["ADMINISTRATOR"]).then( link => {
        console.log(link);
    }).catch(err => {
        console.log(err.stack);
    });

    bot.setInterval(() => {
        for ( let i in bot.mutes ){
            let time = bot.mutes[i].time;
            let guildId = bot.mutes[i].guild;

            let guild = bot.guilds.get(guildId);
            let member = guild.members.get(i);
            let mutedRole = guild.roles.find(r => r.name === "WAWA MUTOU");

            if (!mutedRole) continue;

            if (Date.now() > time ) {
                console.log(`${i} is now able to me unmuted`);
                
                member.removeRole(mutedRole);
                delete bot.mutes[i]; 

                fs.writeFile("./mutes.json", JSON.stringify(bot.mutes, ) ,err =>{
                    if (err) throw err;
                    console.log(`I have unmuted ${member.user.tag}.`);
                });
            }
        }
    }, 5000)

});

//assynchrounous message handler.
bot.on("message", async (message) => {
    //verifica se é bot.
    if(message.author.bot) return;
    if(message.channel.type === "dm" ) return ;


    con.query(`SELECT * FROM xp where id = '${message.author.id}'`, (err,rows) =>{
        if (err) throw err;
        
        let sql;

        if ( rows.length < 1){
            sql = `insert into xp(id,xp) values ('${message.author.id}','${generateXp()}')`
        }else{
            let xp = rows[0].xp;

            sql = `update xp set xp = ${xp + generateXp()} where id = '${message.author.id}'`;
        }
        con.query(sql);
    });

    // pokepulo

    let luck = Math.random();
    if ( luck <= 0.2 )
    {
        message.channel.send({files: [
            {
                attachment: 'https://scontent.fbsb8-2.fna.fbcdn.net/v/t1.0-9/734986_564511160244123_2073955474_n.jpg?oh=16fc8d4d517e0e663af467996b462f4a&oe=5B0D98E1',
                name: "avatar.png"
            }
        ]});


        //message.send.embed({embed: embed})
    }





    let messageArray = message.content.split(" ") ; 
    let command = messageArray[0];
    let args = messageArray.slice(1); // takes off first

    console.log(messageArray);
    console.log(command);
    console.log(args);

    if(!command.startsWith(prefix)) return;

    let cmd = bot.commands.get(command.slice(prefix.length)); //como fizemos um mapa com as funções, aqui é ahora de pegar elas e executa-las.
    if(cmd) cmd.run(bot, message, args, con); // se conseguiu pegar o comando, executa ele.
    
    // if(command == prefix+"userInfo"){
    //     let embed = new Discord.RichEmbed()
    //     .setAuthor(message.author.username)
    //     .setDescription("This is user's info!")
    //     .setColor("#9B59B6")
    //     .addField("Full Username",`${message.author.username}#${message.author.discriminator}`)
    //     .addField("ID",message.author.id)
    //     .addField("Created At", message.author.createdAt);
        

    //     message.channel.sendEmbed(embed);

    //     //4  main ways to take
    //     /*bot.guilds.get("id");
    //     bot.guilds.find(guild => guild.members.size >= 10);
    //     bot.guilds.*/   
    // }
    // if ( command === `${prefix}mute`){
    //     //get the mentioned user, return if there is none.
    //     //check if command executor has the right permission to do this command.
    //     //if the mute has the samer or a righer role than the muter return.
        
    //     if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("You do not have manage message permission");
    //     //if(message.channel.permissionsFor(message.member).hasPermission("MANAGE_MESSAGES");
    //     let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);

    //     if(toMute.id == message.author.id) return message.channel.sendMessage("You cannot mute yourself.");
    //     if(toMute.highestRole.position >= message.member.highestRole.position) return ;

    //     if(!toMute) return message.channel.send("You did not specify a user mention or ID!");
    //         //trata os dois casos, no primeiro que retorna um user
    //         //trata o segundo caso também que retorna um guildMember.
    //         //return message.reply(toMute.username || toMute.user.username);
    //         //verifica antes de criar a role novamente se ela já existe.
    //         let role = message.guild.roles.find(r => r.name == "WAWA MUTOU");
    //         if(!role){
    //             try {
    //                 role = await message.guild.createRole({
    //                     name: "WAWA MUTOU",
    //                     color: "#000000",
    //                     permissions: []
    //                 });
    //                 //map function in collections, a loop to move arround all 
    //                 message.guild.channels.forEach(async( channel,id) => {
    //                     await channel.overwritePermissions(role , {
    //                         SEND_MESSAGES: false,
    //                         ADD_REACTIONS: false
    //                     });
    //                 });
    //             }catch(e){
    //                 console.log(e.stack);
    //             }
    //         }
    //         //if already has the role, do nothing.
    //         if(toMute.roles.has(role.id)) return message.channel.sendMessage("this user is already muted!");
    //         await(toMute.addRole(role));
    //         message.channel.sendMessage("i have muted them");

    //         return ;

    // }
    // if ( command === `${prefix}unmute`){

    //     if(!message.member.hasPermission("MANAGE_MESSSAGES")) return message.channel.sendMessage("You do not have manage messages.");
        
    //     let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    //     if(!toMute) return message.channel.sendMessage("You did not specify a user mention or ID!");


    //     let role = message.guild.roles.find(r => r.name === "WAWA MUTOU");

    //     if(!role || toMute.roles.has(role.id)) return message.channel.sendMessage("this user is not muted");

    //     await toMute.removeRole(role);
    //     message.channel.sendMessage("i have unmuted them.");


    //   return ;

    //}
    
});



bot.login(botSettings.token);