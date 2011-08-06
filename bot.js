var irc     = require('irc'),
    http    = require('http');

var _ = require('underscore');
var commands = require('./commands');

var channels = ['#gaming'],
    debug_channels = ['#test'];

var debug_mode = true;

var bot = new irc.Client('mini-irc.local', 'NodeBot', {
    debug: debug_mode,
    channels: debug_mode ? debug_channels : channels,
    //channels: ['#test'],
});

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
        if ( message.match(/^!topic (\S.+)/i) ) {
            commands.topic(from, to, message, bot);
        }
        if ( message.match(/^!stats/i) ) {
            commands.stats(from, to, message, bot);
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