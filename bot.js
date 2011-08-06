var irc     = require('irc'),
    http    = require('http'),
    fs      = require('fs'),
    express = require('express');

var _ = require('underscore');
var commands = require('./commands');

var   channels = ['#gaming'],
    debug_mode = false;

try {
    fs.lstatSync('./DEBUGMODE');
    debug_mode = true;
    console.log("Debug mode on");
    channels = ['#test'];
} catch (e) {
    // normal mode
}

var bot = new irc.Client('mini-irc.local', 'NodeBot', {
    debug: debug_mode,
    channels: channels,
});

// POST API for sending messages to channel
// API: JSON -> {"type": "say", "channels": ["#gaming"], "message": "deploy complete"}
// curl -v -H "Content-Type: application/json" -X POST -d '{"type": "say", "channels": ["#test", "#gaming"], "message": "deploy complete"}' http://localhost:4000/api
var app = express.createServer();
app.use(express.bodyParser());
app.post('/api', function(req, res){
    if (req.body['type'] == "say") {
        _.each(req.body['channels'], function (channel) {
            bot.say(channel, req.body['message']);
        });
        res.end(JSON.stringify({"status": "ok"}));
    }
});

app.listen(4000);


// Bot Listeners
//================

bot.addListener('registered', function() {
    // Connected to server -> nickserv identify
    bot.say("nickserv", "identify botpass")
});

bot.addListener('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    if ( to.match(/^[#&]/) ) {
        // channel message
        if ( message.match(/^!commands/i) ) {
            bot.say(to, "Available Commands:");
            _.each(commands.commands, function (c) {
                bot.say(to, c[0] + ": " + c[1]);
            });
        }
        else if ( message.match(/^!topic (\S.+)/i) ) {
            commands.topic(from, to, message, bot);
        }
        else if ( message.match(/^!stats/i) ) {
            commands.stats(from, to, message, bot);
        }
        else if ( message.match(/^!ping/i) ) {
            commands.ping(from, to, message, bot);
        }
    }
    else {
        // private message
    }
});




bot.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

// unhandled

bot.addListener('message#blah', function (from, message) {
    console.log('<%s> %s', from, message);
});

bot.addListener('pm', function(nick, message) {
    console.log('Got private message from %s: %s', nick, message);
});
bot.addListener('join', function(channel, who) {
    console.log('%s has joined %s', who, channel);
});
bot.addListener('part', function(channel, who, reason) {
    console.log('%s has left %s: %s', who, channel, reason);
});
bot.addListener('kick', function(channel, who, by, reason) {
    console.log('%s was kicked from %s by %s: %s', who, channel, by, reason);
});