registerPlugin({
    name: 'Radio 3666khz Songtext-Anzeige',
    version: '1.0.1',
    description: 'Zeigt in der Kanalbeschreibung den aktuell gespielten Titel an',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    requiredModules: ['http'], 
    vars: {
        id1: {
            title: 'Select Channel',
            type: 'channel',
        },
        interval: {
            title: 'Intervall in Sekunden',
            type: 'number',
            placeholder: '60'
        },
        description: {
            title: 'Original Channel Description',
            type: 'multiline'
        }
    }
}, (_, config, meta) => {
    // import modules
    const engine = require('engine');
    const http = require('http');
    const backend = require('backend');
    const media = require('media');
    var description = '';
    var length = 60;
    // Channel Description static
    /* var description = "\
    [center][img]https://gateway-deutschland.de/media/images/route666_small.jpg[/img]\n\n\
    [size=13][b][i]Rock, Hamspirit und so...3666kHz.[/i][/b][/size]\n\n\
    Hier gibt es das aussergewöhnliche Radioerlebnis der alten Schule. Sender der Kurzwellen Runde auf 3666khz. [URL]www.3666khz.de[/URL] Viel Spaß beim lauschen";
    */

    waitForBackend(10, 3)
    .then(() => {
        engine.log(meta.name + ' V' + meta.version + ' > The script has loaded successfully!');
        if (!config || !config.id1 || !config.interval) {
            engine.log("Nicht Konfiguriert! Script beendet...");
            return;
        }
        if (config.description) {
            description = config.description;
        }
        // send request
        
        setInterval(() => {
            http.simpleRequest({
                'method': 'GET',
                'url': 'https://api.laut.fm/station/heiderocker/current_song',
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
                var channel_id1 = backend.getChannelByID(config.id1);
                var track = media.getCurrentTrack();
                /*try {            
                    length = (obj.length + 2);
                    desc = description + ('\n\n[size=10][u]Sie hören:[/u] \n[i][b][color=red]' + obj.artist.name + '[color=black] - [color=blue]' + obj.title + '[/color][/b][/i]');
                } catch {
                    length = config.interval;
                    desc = description;
                    
                };*/
                desc = description + ('\n\n[size=10][u]Sie hören:[/u] \n[i][b][color=red]' + track.tempArtist() + '[color=black] - [color=blue]' + track.tempTitle() + '[/color][/b][/i]');
                channel_id1.setDescription(desc); 
                if (track.duration() > 1) {
                    length = track.duration();
                } else {
                    length = (config.interval * 1000);
                }
            });
        }, length * 1000);
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