registerPlugin({
    name: 'Reconnect',
    version: '2.3a',
    description: 'Reconnect after connection lost or kick - with optional automatic reconnect after x minutes',
    author: 'TS3index.com <info@ts3index.com> / Modded by Michael <michael@hertel-wolfhagen.de>',
    backends: ['ts3', 'discord'],
    vars: [
        {
            name: 'autorestart',
            title: 'Auto-Neustart der Instanz alle X - Minuten',
            type: 'checkbox'
        },
        {
            name: 'restarttime',
            indent: 2,
            title: 'Minuten:',
            type: 'number',
            placeholder: '1440',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
        {
            name: 'spacer0',
            title: '',
        },
        {
            name: 'dev',
            title: 'enable DEBUG',
            type: 'checkbox'
        }
    ]
}, function(_, config, meta) {
    var engine = require('engine');
    var backend = require('backend');
    var event = require('event');
    var message = meta.name + ' V ' + meta.version +' > ';

    if (!config || typeof config.autorestart == 'undefined') {
        config.autorestart = false;
        engine.saveConfig(config);
    }
    if (!config || typeof config.dev == 'undefined') {
        config.dev = false;
        engine.saveConfig(config);
    }
    if (typeof config.restarttime == 'undefined' || !config.restarttime || !parseInt(config.restarttime) || config.restarttime < 10) {
        config.restarttime = 1440;
        engine.saveConfig(config);
    }
    
    event.on('load', () => {
            let messagetxt = message + 'loaded successfully.';
            if (config.autorestart) messagetxt + ' - Autorestart: ' + config.restarttime + ' Minutes';
            engine.log(messagetxt);
        });

    event.on('disconnect', () => {
            if (config.dev) engine.log(message + 'detect disconnect event.');
            checkConnection();
        });
    
    event.on('clientKicked', (moveInfo) => {
            if (moveInfo.client.isSelf()) {
                if (config.dev) engine.log(message + 'detect, bot was kicked');
                setTimeout(checkConnection, 3000);
            }
        });
    
    if (config.autorestart) {
        setInterval(function(){
            engine.log(message + 'Auto-Restart instance ...');
            backend.disconnect();
            waitForBackend(10,5);
        }, config.restarttime * 1000 * 60);
    }

    setInterval(checkConnection, 60000);

    function checkConnection() {
        // if (config.dev) engine.log(message + 'check connection interval start.');
        if (!backend.isConnected() || !engine.isRunning()) {
            if (config.dev) engine.log(message + 'something is wrong. Try to reconnect...');
            backend.disconnect();
            waitForBackend(10, 5);
        }
    }

    function waitForBackend(attempts, wait) {
        return new Promise((success, fail) => {
            let attempt = 1;
            const timer = setInterval(() => {
                setTimeout(() => { backend.connect(); }, 3500);
                if (backend.isConnected()) {
                    clearInterval(timer);
                    if (config.dev) engine.log('waitForBackend() took ' + attempt + ' attempts with a timer of ' + wait + ' seconds to resolve');
                    success();
                    return;
                } else if (attempt > attempts) {
                    clearInterval(timer);
                    if (config.dev) engine.log('waitForBackend() failed at ' + attempt + '. attempt with a timer of ' + wait + ' seconds');
                    fail('backend');
                    return;
                }
                
                attempt++;
            }, wait * 1000);
        });
    }
});
