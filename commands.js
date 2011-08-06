request = require('request');

module.exports = {
    commands: [
        ["!topic", "!topic <newtopic> changes the current topic"],
        ["!stats", "spits out some cool jtv stats"]
    ],

    topic: function (from, to, message, bot) {
        bot.send("TOPIC", to, message.match(/^!topic (\S.+)/i)[1]);
    },

    stats: function (from, to, message, bot) {
        request({uri:'http://usher.justin.tv/stream/summary.json'}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                stats = JSON.parse(body)[0];

                // ASCII character code for bold text
                c_b = String.fromCharCode(02) + " ";

                statsString = "There are currently " + c_b + stats['stream_count'] + c_b + "viewers watching " +
                                                     stats['channelscount'] + " streams pulling " + c_b + 
                                                     Math.round(stats['outbound_bandwidth'] / 1000) + c_b + "GBps of bandwidth";
                bot.say(to, statsString);
            }
        });
    }

}