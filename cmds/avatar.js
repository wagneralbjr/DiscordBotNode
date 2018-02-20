module.exports.run = async (bot, message, args) => {
    console.log("avatar");
    let msg = await message.channel.send("generating avatar...")
    let target = message.mentions.users.first() || message.author;
    message.channel.send({files: [
        {
            attachment: target.displayAvatarURL,
            name: "avatar.png"
        }
    ]});
    

    msg.delete();

}


module.exports.help = {
    name: "avatar"
}