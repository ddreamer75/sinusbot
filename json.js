registerPlugin({
    name: 'Livestream Listeners',
    version: '1.0.1',
    description: 'Zeigt in TS3 die Anzahl der Livestream hörer an',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    requiredModules: ['http'], 
    vars: {
        id1: {
            title: 'Channel für Anzeige',
            type: 'channel'
        },
        interval: {
            title: 'Intervall in Sekunden',
            type: 'number',
            placeholder: '60'
        }
    }
}, (_, config, meta) => {
    // import modules
    const engine = require('engine');
    const http = require('http');
    const backend = require('backend');

    // Channel Description static
    var description = '[SIZE=12][color=black][B][u]Livestream Serverinfos:[/u][/B][/color][/SIZE]\n[size=9]';

    waitForBackend(10, 3)
    .then(() => {
        engine.log(meta.name + ' V' + meta.version + ' > The script has loaded successfully!');
        if (!config || !config.id1 || !config.interval) {
            engine.log("Nicht Konfiguriert! Script beendet...");
            return;
        }
        if (backend.getChannelByID(config.id1) === undefined) {
            engine.log("Channel für Anzeige existiert nicht! Script bendet...");
            return;
        }
        // send request
        
        setInterval(() => {
            http.simpleRequest({
                'method': 'GET',
                'url': 'http://127.0.0.1:8000/status-json.xsl',
                'timeout': 6000,
            }, function (error, response) {
                if (error) {
                    engine.log("Error: " + error);
                    return;
                }
                
                if (response.statusCode != 200) {
                    engine.log("HTTP Error: " + response.status);
                    return;
                }
                
                // success!
                const json = response.data.toString();
                const obj = JSON.parse(json);
                var channel_id1 = backend.getChannelByID(config.id1)
                try {            
                    var listeners = 'Hörer:  ' + obj.icestats.source.listeners;
                    desc = description + ('\n[b][color=red]Stream Start: [color=blue]' + obj.icestats.source["stream_start"] + '\n[color=red]Bitrate: [color=blue]' + obj.icestats.source.bitrate + 'kBit\n[color=red]Sample rate: [color=blue]' + obj.icestats.source["ice-samplerate"] + 'Hz\n[color=red]akt. Zuhörer: [color=blue]' + obj.icestats.source.listeners + '\n[color=red]max. Zuhörer: [color=blue]' + obj.icestats.source.listener_peak + '[/b]');
                } catch {
                    var listeners = 'OFFLINE!';
                    desc = description + ('\n[b][color=red]Z.Zt. OFFLINE! [/color][/b]');
                }
                ;
                // engine.log('Data: ' + response.data.toString());
                channel_id1.update ({  name: '[cspacer] Livestream ' + listeners  });
                channel_id1.setDescription(desc); 
                // engine.log("JSON Parse Obj (Listeners): " + listeners);
            });
        }, config.interval * 1000);
    })

    .catch(error => {
        if (error === 'backend') {
            engine.log(
                meta.name + ' V' + meta.version + ' > The bot was not able to connect to the backend in time! To use this script, the bot needs to be connected to your TeamSpeak server. Make sure it can connect. Deactivating script...'
            );
        } else {
            engine.log(meta.name + ' V' + meta.version + ' > Unknown error occured! Please report this to the script author.');
            console.log(error);
        }
    });
    


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