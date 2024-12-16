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
        },
        {
            name: 'talkpower',
            title: 'Remove Talkpower on QRM-Channel during Playback',
            type: 'checkbox'
        },
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
        }
    ]
}, function(sinusbot, config) {
    const engine = require('engine');
    const backend = require('backend');
    const media = require('media');
    const event = require('event');
    const channel = backend.getCurrentChannel();
    var interval = '';
    

    if (!config || typeof config.Track == 'undefined' || typeof config.autorestart == 'undefined') {
        config.autorestart = false;
        engine.saveConfig(config);
    }
    if (typeof config.restarttime == 'undefined' || !config.restarttime || !parseInt(config.restarttime) || config.restarttime < 10) {
        config.restarttime = 1440;
        engine.saveConfig(config);
    }

    main();
    
 
    function main() {
        if (config.autorestart) {
            interval = setInterval(function(){
                if (backend.isConnected) {
                    // engine.log('Auto-Restart QRM Playback ...');
                    if (config.talkpower) {
                        channel.update({
                        neededTalkPower: 5000
                    });
                }
                    media.playURL(config.Track["url"]);
                }

            }, config.restarttime * 1000);
        }
    }

    event.on('trackEnd', function (ev) {
		if (config.talkower) {
            channel.update({
                neededTalkPower: 10
            });
        }
        clearInterval(interval);
        main();
        
	});
});
