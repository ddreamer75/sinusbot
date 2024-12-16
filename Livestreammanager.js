registerPlugin({
    name: 'Livestream Manager',
    version: '1.1',
    description: 'Management for Livestream Control BOT only !',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    backends: ['ts3'],
    vars: [
        {
            name: 'autorestart',
            title: 'Wiederkehrende Standart Ansage definieren und aktivieren',
            type: 'checkbox'
        },
        {
            name: 'defaultTrack',
            indent: 2,
            title: 'Standart Musik-/Ansage Track',
            type: 'track',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'restarttime',
            indent: 2,
            title: 'Wiederholung in Sekunden:',
            type: 'number',
            placeholder: '75',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'serviceenabled',
            title: 'Sonderfunktion- / Extra Asnage aktivieren',
            type: 'checkbox'
        },
        {
            name: 'specialTrack',
            indent: 2,
            title: 'Spezial Musik-/Ansage Track',
            type: 'track',
            conditions: [
                { field: 'serviceenabled', value: true }
            ]
        },
        {
            name: 'bridgeoffline',
            indent: 2,
            title: 'Spiele Spezial Musik-/Ansage Track, wenn Audio-Bridge offline oder gemuted ist',
            type: 'checkbox',
            conditions: [
                { field: 'serviceenabled', value: true }
            ]
        },
        {
            name: 'servicetime',
            indent: 2,
            title: 'Verändere Zeitabstände des Spezial Musik-/Ansage Tracks ',
            type: 'number',
            placeholder: '45',
            conditions: [
                { field: 'serviceenabled', value: true },
                { field: 'bridgeoffline', value: true }
            ]
        }

    ]
}, function(_, config, meta) {
    const engine = require('engine');
    const backend = require('backend');
    const media = require('media');
    const event = require('event');
    //const channel = backend.getCurrentChannel();


    // Fixed ClientUID (must be Live Stream Control Bot)
    const botid = '24977'; // Client-ID vom Livestream BOT
    const channelid = 2052; // ChannelID von LiveStreamControl
    const bridgeuid = 'sZhU+e3pE5fXvGjaOTEES7ouRBI='; // Audio Bridge
    const livestreamuid = '92tiVuxUAt7PsmX86a81cGPSmxM='; // Live Stream Audio Out
    var wartungsmodus = false; // für Log zwecke
    var message = meta.name + ' - V' + meta.version + ' > ';
    

    if (!config || typeof config.defaultTrack == 'undefined' || typeof config.autorestart == 'undefined') {
        config.autorestart = false;
        engine.saveConfig(config);
    }
    if (typeof config.restarttime == 'undefined' || !config.restarttime || !parseInt(config.restarttime) || config.restarttime < 10) {
        config.restarttime = 75;
        engine.saveConfig(config);
    }
    if (typeof config.servicetime == 'undefined' || !config.servicetime || !parseInt(config.servicetime) || config.servicetime < 10) {
        config.servicetime = config.restarttime;
        engine.saveConfig(config);
    }
 
    
    function main(time) {
        if (isNaN(time) || typeof time == 'undefined') var time = config.restarttime;
        if (config.autorestart || config.serviceenabled) {
            const playtimer = setInterval(() => {
                if (config.serviceenabled && config.bridgeoffline) {
                    let checkaudiobot = backend.getClientByUID(bridgeuid);
                    let checklivestreambot = backend.getClientByUID(livestreamuid);
                    if (typeof checkaudiobot == 'undefined' || checkaudiobot.isDeaf() || checkaudiobot.isAway() || !isinChannel(checkaudiobot, channelid) || isinServergroup(checkaudiobot, 19)) {
                        media.playURL(config.specialTrack["url"]);
                        if (!wartungsmodus) {
                            engine.log('Livestream im Wartungsmodus !');
                            wartungsmodus = true;
                            clearInterval(playtimer);
                            time = config.servicetime;
                            main(time);
                        }
                    } else {

                        media.playURL(config.defaultTrack["url"]);
                        clearInterval(playtimer);
                        time = config.restarttime;

                        if (wartungsmodus) {
                            engine.log('Livestream wurde aus dem Wartungsmodus genommen. Normalbetrieb');
                            wartungsmodus = false;
                        };
                        main(time);

                        return;
                    }
                }

            }, time * 1000);
        }
    
    }      
    
    function isinChannel(client, id) {
        return client.getChannels().some(channel => {
            return channel.id() == id;
        });
    }

    function isinServergroup(client, id) {
        return client.getServerGroups().some(group => {
            return group.id() == id;
        });
    }

    function waitForBackend(attempts, wait) {
        return new Promise((success, fail) => {
            let attempt = 1;
            const timer = setInterval(() => {
                if (backend.isConnected()) {
                    clearInterval(timer);
                    success();
                    return;
                } else if (attempt > attempts) {
                    clearInterval(timer);
                    fail('backend');
                    return;
                }

                attempt++;
            }, wait * 1000);
        });
    }

    event.on('load', () => {
        waitForBackend(10, 5)
                    .then(() => {
                        engine.log(message + 'The script has loaded successfully!');
                        let channel = backend.getCurrentChannel();

                        if (parseInt(channel.id()) !== channelid) {
                            engine.log(message + 'Script only works, if BOT is in his Channel' + backend.getChannelByID(channelid).name() + '. DISABLED!');
                            config.autorestart = false;
                            config.serviceenabled = false;
                            engine.saveConfig(config);
                            return; 
                        }
                    main();
                    });


    });
});
