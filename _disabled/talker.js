registerPlugin({
    name: 'TOT-Eliminator',
    version: '1.0',
    description: 'Eliminates Time-Out-Talink problem',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    backends: ['ts3', 'discord'],
    vars: [
        {
            name: 'autorestart',
            title: 'TOT Eliminator setzen',
            type: 'checkbox'
        },
        /*{
            name: 'Track',
            indent: 2,
            title: 'Play TOT-Sound',
            type: 'track',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },*/
        {
            name: 'tottime',
            indent: 2,
            title: 'Zeit in Sekunden bei TOT (min. 200 / max. 300)',
            type: 'number',
            placeholder: '250',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'totpause',
            indent: 2,
            title: 'Zeit in Sekunden für Pause (min.1)',
            type: 'number',
            placeholder: '2',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'delay',
            indent: 2,
            title: 'Delay in Sekunden zwichen 2 durchgängen (min. 1 / max. 5)',
            type: 'number',
            placeholder: '2',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'debug',
            indent: 2,
            title: 'Debug Logging enable',
            type: 'checkbox',
            conditions: [
                { field: 'autorestart', value: true }
            ]

        }

    ]
}, function(sinusbot, config) {
    var engine = require('engine');
    var media = require('media');
    var event = require('event');
    var store = require('store');
    var backend = require ('backend');
    var audio = require ('audio');

    // Lösche Datenbanken ... wegen der Sicherheit
    store.unset('talker');
    store.unset('starttime');
    store.unset('endtime');
    store.unsetGlobal('TOT');
        
    /* if (!config || typeof config.Track == 'undefined' || typeof config.autorestart == 'undefined') {
        config.autorestart = false;
        engine.saveConfig(config);
    }*/
    if (typeof config.totpause == 'undefined' || !config.totpause || !parseInt(config.totpause) || config.totpause < 1) {
        config.totpause = 2;
        engine.saveConfig(config);
    }
    if (typeof config.tottime == 'undefined' || !config.tottime || !parseInt(config.tottime) || config.tottime < 10 || config.tottime > 300) {
        config.tottime = 250;
        engine.saveConfig(config);
    }
    if (typeof config.delay == 'undefined' || !config.delay || !parseInt(config.delay) || config.delay < 1 || config.delay > 5) {
        config.delay = 2;
        engine.saveConfig(config);
    }
    if (config.autorestart) {
        store.setGlobal('TOT', true);
        setInterval(checktiming, 1000);
        setInterval(moveclient, 1000);
    }

    

    function moveclientback() {
        var timer = new Date();
        var channel = backend.getCurrentChannel();
        if (config.debug) engine.log('Talkpower wiederhergestellt.');
        channel.update({
            neededTalkPower: 5,
        });
        // var starttime = timer.getTime();
        // store.set('starttime', starttime);
    }      
    
    
    function checktiming() {
        var timer = new Date();
        var starttime = timer.getTime();
        if (!audio.isPlaying()) {
            if (store.get('talker') && !store.get('starttime')) {
                store.set('talker', true);
                store.set('starttime', starttime);
            }

            if (store.get('talker') && store.get('endtime')) {
                var diff = Math.round((starttime - store.get('endtime')) / 1000);
                if (config.debug) engine.log('Diff Abfrage eigeleitet: ' + starttime / 1000 + ' - ' + store.get('endtime') / 1000 + ' = ' + diff);
                if (diff >= config.delay) {
                    store.set('starttime', starttime);
                    store.unset('endtime');
                    if (config.debug) engine.log('Sprechpause-Delay von ' + config.delay + ' Sek. eingehalten. (Ist: ' + diff + ' Sek.');
                    // store.unset('enddtime');
                } else {
                    // store.unset('enddtime');
                    if (config.debug) engine.log('Sprechpause zwischen 2 Durchgängen kleiner als ' + config.delay + ' Sek. (Ist: ' + diff + ' Sek.)');
                }
            }
        }
    }
    
    
    function moveclient() {
        var channel = backend.getCurrentChannel();
        var timer = new Date();
        if (config.debug) {
            engine.log('Talkpower-Enziehen aufgerufen');
            engine.log('Bedingung: ' + timer.getTime() /1000 + ' - ' + store.get('starttime') / 1000 + ' >= ' + (timer.getTime() - store.get('starttime')) / 1000 + '(' + config.tottime + ')');
        }
            // media.playURL(config.Track["url"]);

        if (Math.round((timer.getTime() - store.get('starttime')) / 1000) >= config.tottime) {
            engine.log('TOT Erreicht, Unterbreche für ' + config.totpause + ' Sekunden die Eingabe');
            channel.update({
                neededTalkPower: 5000,
            });
            store.set('starttime', timer.getTime());
            setTimeout(moveclientback, config.totpause * 1000);

        }
        //clearInterval(move);    
    }
    
    if (config.autorestart) {
        event.on('talkerCount', function (ev) {
            var timer = new Date();
            // const channel = backend.getCurrentChannel();
            var playing = media.getCurrentTrack();
            if (ev == 1) {
                store.set('talker', true);       
                // if (config.debug) engine.log('Timing-func durchlaufen (Result: ' + checktiming() + ')');      
                // if (config.debug) engine.log('Timing-func durchlaufen (Result: ' + checktiming);
                // checktiming();
                //    setInterval(moveclient, config.tottime * 1000);
                if (config.debug) engine.log('Intervall gestartet: ' + config.tottime + ' Sekunden bis TOT.');                   
                    
            } else if (ev == 0) {
                store.unset('talker');
                store.set('endtime', timer.getTime());
                store.unset('starttime');
                if (config.debug) engine.log('Durchgang beendet. Es spricht niemand.');
            } else if (ev > 1) {
                if (config.debug) engine.log('Es sprechen zu viele! (Result: ' + ev + ')');
            }
            
        });
    }
});
