module.exports.run = async (bot, message, args, con) => {
    let target = message.mentions.users.first() || message.guild.members.get(args[1]) || message.author;

    con.query(` select * from xp where id = '${target.id}'`, (err,rows) =>{
        if(err) throw err;

        if(!rows[0]) return message.channel.send("This user has not xp.");
        let xp = rows[0].xp;
        message.channel.send(xp);
    } );


}


module.exports.help = {
    name: "xp"
}