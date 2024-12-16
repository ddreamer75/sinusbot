registerPlugin({
    name: 'QRM-PLayback',
    version: '1.0',
    description: 'Plays a given file all x seconds',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    backends: ['ts3', 'discord'],
    vars: [
        {
            name: 'autorestart',
            title: 'Auto-Restart every X seconds',
            type: 'checkbox'
        },/*
        {
            name: 'talkpower',
            title: 'Remove Talkpower on QRM-Channel during Playback',
            type: 'checkbox'
        },*/
        {
            name: 'Track',
            indent: 2,
            title: 'Play Track',
            type: 'track',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'restarttime',
            indent: 2,
            title: 'Seconds:',
            type: 'number',
            placeholder: '1440',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'trackchange',
            indent: 2,
            title: 'Change Audio-Track if something happend on specified client-uid',
            type: 'checkbox',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'newTrack',
            indent: 3,
            title: 'Special Audio-Track to play',
            type: 'track',
            conditions: [
                { field: 'autorestart', value: true },
                { field: 'trackchange', value: true }
            ]
        },
        {
            name: 'clientuid',
            indent: 3,
            title: 'ClientUID that is specialized',
            type: 'string',
            conditions: [
                { field: 'autorestart', value: true },
                { field: 'trackchange', value: true }
            ]
        },
        {
            name: 'channelid',
            indent: 3,
            title: 'ChannelID, where the client must be homed',
            type: 'channel',
            conditions: [
                { field: 'autorestart', value: true },
                { field: 'trackchange', value: true }
            ]
        }
    ]
}, function(sinusbot, config) {
    const engine = require('engine');
    const backend = require('backend');
    const media = require('media');
    const event = require('event');
    const channel = backend.getCurrentChannel();
    

    if (!config || typeof config.Track == 'undefined' || typeof config.autorestart == 'undefined') {
        config.autorestart = false;
        engine.saveConfig(config);
    }
    if (typeof config.restarttime == 'undefined' || !config.restarttime || !parseInt(config.restarttime) || config.restarttime < 10) {
        config.restarttime = 1440;
        engine.saveConfig(config);
    }
    if (newTrack && (typeof config.newTrack == 'undefined' || typeof config.clientuid == 'undefined' || config.clientuid.length !== 28)) {
        config.newTrack = false;
        engine.saveConfig(config);
    }
    
     if (config.autorestart) {
        setInterval(function(){
            if (backend.isConnected()) {
                if (config.newTrack) {
                    let channel = backend.getClientByID(config.channelid);
                    let client = backend.getClientByUID(config.clientuid);
                    let clin

                }
                /*
                // War mal nen Versuch, mit Talkpower aber wird nicht benötigt
                if (config.talkpower) {
                    channel.update({
                    neededTalkPower: 5000
                    });
                } */

                let 
                if (config.newTrack && 
                media.playURL(config.Track["url"]);
            }

        }, config.restarttime * 1000);
    }




    event.on('trackEnd', function (ev) {
        /*
        // War mal nen Versuch, mit Talkpower aber wird nicht benötigt
		if (config.talkower) {
            channel.update({
                neededTalkPower: 10
            });
        } */
	});
});
