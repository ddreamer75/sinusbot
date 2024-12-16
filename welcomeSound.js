registerPlugin({
    name: 'GUEST-WelcomeSound',
    version: '1.4',
    description: 'Dieser Script begrüßt alle neuen User mit einem Audio-File.',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    vars: [
        {
            name: 'channelId',
            title: 'Warteraum/Lobby Channel:',
            type: 'channel',
            placeholder : 'Channel ID'
        },
        {
            name: 'guestgroup',
            title: 'Gast-Servergruppen ID:',
            type: 'string',
            placeholder: 'Wähle eine Serverguppe...'
        },      
        {
            name: 'OStrack',
            title: 'Spiele OS-Basierenden Audio Track',
            type: 'select',
            options: ['Ja', 'Nein']
        },
        {
            name: 'track',
            indent: 2,
            title: 'Standard Sound-Datei:',
            type: 'track',
            placeholder: 'Wähle den Track aus ...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 1
                },
            ]
            
        },
        {
            name: 'WINtrack',
            indent: 2,
            title: 'WINDOWS - Sound Datei:',
            type: 'track',
            placeholder: 'Wähle den Track für Windows-User aus ...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
            
        },
        {
            name: 'LINUXtrack',
            indent: 2,
            title: 'LINUX - Sound Datei:',
            type: 'track',
            placeholder: 'Wähle den Track für -User aus ...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
            
        },
        {
            name: 'ANDROIDtrack',
            indent: 2,
            title: 'ANDROID - Sound Datei:',
            type: 'track',
            placeholder: 'Wähle den Track für Android-User aus ...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
            
        },
        {
            name: 'IOStrack',
            indent: 2,
            title: 'Apple iOS - Sound Datei:',
            type: 'track',
            placeholder: 'Wähle den Track für Apple iOS-User aus ...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
            
        },
        {
            name: 'trackunkown',
            indent: 2,
            title: 'Spezielle Sounddatei abspielen, wenn Betriebssystem nicht erkannt wird',
            type: 'checkbox',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
        },
        {
            name: 'UNKNOWNtrack',
            indent: 3,
            title: 'Sound Datei falls OS nicht erkannt wird:',
            type: 'track',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {   field: 'trackunkown',
                    value: true
                }
            ]
            
        },
        {
            name: 'spacer2',
            title: ''
        },
        {
            name: 'outtime',
            indent: 2,
            title: 'Spezielle Sounddatei in der Zeit von 22:59 - 08:59 Uhr',
            type: 'checkbox',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
        },
        {
            name: 'OUTTIMEtrack',
            indent: 3,
            title: 'Sound Datei die in der Zeit von 22:59 - 08:59 Uhr abgespielt wird:',
            type: 'track',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {   field: 'outtime',
                    value: true
                }
            ]
            
        },
        {
            name: 'spacer4',
            title: '',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {   field: 'outtime',
                    value: true
                }
            ]
        },
        {
            name: 'adminoffline',
            indent: 2,
            title: 'Spezielle Sounddatei wenn kein Administrator im Userraum ist',
            type: 'checkbox',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
        },
        {
            name: 'OFFLINEtrack',
            indent: 3,
            title: 'Sound Datei die gespielt wird, wenn kein Admin im Userraum ist',
            type: 'track',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {   field: 'adminoffline',
                    value: true
                }
            ]
            
        },
        {
            name: 'spacer0',
            title: '',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {   field: 'adminoffline',
                    value: true
                }
            ]
        },
        {
            name: 'movechannelId',
            indent: 2,
            title: 'Channel, in den der neue User nach Ansage verschoben wird:',
            type: 'channel',
            placeholder : 'Channel ID',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
        },
        {
            name: 'setservergroup',
            indent: 2,
            title: 'Spezielle Serverguppe setzten nach abspielen des Tracks',
            type: 'checkbox',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
            ]
        },
        {
            name: 'moveservergroup',
            indent: 3,
            title: 'Nutzer mit spezieller Servergruppe automatisch in den Channel verschieben',
            type: 'checkbox',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {
                    field: 'setservergroup',
                    value: true
                }
            ]
        },
        {
            name: 'servergroup',
            indent: 2,
            title: 'Servergruppen-ID',
            type: 'string',
            placeholder: 'Wähle eine Serverguppe...',
            conditions: [
                {
                    field: 'OStrack',
                    value: 0
                },
                {
                    field: 'setservergroup',
                    value: true
                }
            ]
        },
        {
            name: 'spacer1',
            title: ''
        },
        {
            name: 'dev',
            indent: 8,
            title: 'Debugging aktivieren',
            type: 'checkbox'
        }

    ]
}, function(_, config, meta) {
    var engine = require('engine');
    var backend = require('backend');
    var event = require('event');
    var media = require('media');
    var audio = require('audio');
    
    if (!config || typeof config.channelId == 'undefined' || !config.channelId) {
      engine.log("Default settings invalid.");
      return;
    }
    if (config.OStrack == 1 && (typeof config.track == 'undefined' || !config.track )) {
        engine.log("default-track settings invalid.");
        return;
      }
    if (typeof config.guestgroup == 'undefined' || !config.guestgroup ) {
        engine.log("Guestgroup settings invalid.");
        return;
    }
    if (config.OStrack == 0 && (typeof config.movechannelId == 'undefined' || !config.movechannelId)) {
        engine.log("OS-Track settings invalid.");
        return;
    }
    if (config.setservergroup && (typeof config.servergroup == 'undefined' || !config.servergroup)) {
        engine.log("Servergroup settings invalid.");
        return;
    }

    if (isNaN(config.channelId)) {
        if (engine.isRunning() && backend.isConnected()) {
            engine.log("No valid Channel ID, search Channel...");
            var channel = backend.getChannelByName(config.channelId);
            if (typeof channel == 'undefined' || channel.id() < 1) {
                engine.log("No Channel found, Settings invalid... Script not loaded.");
                return;
            } else {
                engine.log("Channel '" + channel.name() + "' with ID '" + channel.id() + "' found, Settings improved.");
                config.channelId = channel.id();
                engine.saveConfig(config);
            }
        } else {
            engine.log("No valid Channel ID and Instance is not running... Script not loaded.");
            return;
        }
    }
    

    var trackurl = undefined;
    var OSString = undefined;    
    var user = undefined;
    var count = 0;
    var clientsuccess = undefined;
    var timer = '';
    var msg = '';

    audio.setMute(false);
  
    event.on('load', () => {
        waitForBackend(10, 5)
            .then(() => {
                let channel = backend.getChannelByID(config.channelId);
                let clients = channel.getClients();

                clients.forEach(client => {
                    if (isinGroup(client, config.guestgroup)) {
                        client.kick('Warteschlange voll. Bitte versuche es in einigen Minuten erneut.');
                    }
                });
                engine.log(meta.name + ' - V' + meta.version + ' has loaded succesfully.');
            });
    });
    
    event.on('clientMove', function(ev) {
        if (!backend.isConnected()) return;
        if (ev.client.isSelf()) return;
        if (ev.client.type() != 0) return;

        let fromchannel = 0;
        if (typeof ev.fromChannel == 'undefined') { fromchannel = 0 } else { fromchannel = ev.fromChannel.id() }

        if ((fromchannel == 0 || fromchannel == 7) && typeof ev.toChannel != 'undefined' && ev.toChannel.id() == config.channelId) {
            if (config.setservergroup && config.moveservergroup && isinGroup(ev.client, config.servergroup)) {
                if (config.dev) engine.log('User (' + ev.client.name() + ') has already hear the Track, move to Channel-ID: ' + config.movechannelId);
                ev.client.moveTo(config.movechannelId);
                return;
            }

            if (isinGroup(ev.client, config.guestgroup) == false && isinGroup(ev.client, config.servergroup) == false) {
                if (config.dev) engine.log('Non-Guest User (' + ev.client.name() + ') joins the Channel, abort.');
                return;
            }

            if (config.dev) {
                engine.log('Welcome-Sound was triggert by ' + ev.client.name() + ' / current setting: ' + config.OStrack);
                engine.log('Client is: ' + ev.client.type() + ' / is in defined guest group: ' + isinGroup(ev.client, config.guestgroup) + ' / comes from Channel: ' + ev.fromChannel + ' / goes to channel: ' + ev.toChannel.id() + ' (want: ' + config.channelId + ')');
            }

            if ((isinGroup(ev.client, config.guestgroup) || isinGroup(ev.client, config.servergroup))) {

                count++;

                if (config.dev) engine.log ('Count: '  + count);
                // Checke, ob mehr als 1 Gast in der Wartehalle ist, wenn ja kicken mit Nachrich
                if (count > 1) {
                    if (isinGroup(ev.client, config.servergroup)) {
                        if (config.dev) engine.log ('Client always hear track and Channel ist full. Move to ChanneL: '  + config.movechannelId);
                        ev.client.moveTo(config.movechannelId);
                    } else {
                        engine.log('----> ' + ev.client.name() + ' joined, but kicked -- channel busy!');
                        ev.client.poke('Warteschlange voll. Bitte versuche es in einigen Minuten erneut.');
                        ev.client.kick('Warteschlange voll. Bitte versuche es in einigen Minuten erneut.');
                    }
                    sleep(2000)
                    .then(() => {count--;});
                    return;     
                }
                
                engine.log(ev.client.name() + ' - joined');

                if (config.dev) engine.log('All ok, starting...');
                if (config.OStrack == 1 && count == 1) {
                    engine.log(ev.client.name() + " - Playback Default-Track...");
                        user = ev.client;
                        trackurl = config.track["url"] + '&callback=welcomesound&copy=true';
                        // if (media.playURL(trackurl) && config.setservergroup) user.addToServerGroup(config.servergroup);
                        playtrack(trackurl);
                    } else if (config.OStrack == 0 && count == 1) {
                        user = ev.client;
                    sleep(2000)
                    .then(() => {
                        let time = new Date();
                        let timehr = time.getHours();

                        if (config.outtime && typeof config.OUTTIMEtrack != 'undefined' && (timehr <= 9 || timehr > 22)) {
                            // Playin "out of Time" - Pre-Track 23:00 Uhr - 08:59
                            engine.log(ev.client.name() + ' - Playback Out-Of-Time Track (22:59 - 08:59)');
                            trackurl = config.OUTTIMEtrack["url"];
                            playtrack (trackurl);
                            msg = 'Freischaltungen nur zwischen 09:00 - 23:00 Uhr';
                            return;
                        }
                        
                        // Checke ob Admin im Userraum (wenn konfiguriert)
                        if (config.adminoffline && typeof config.OFFLINEtrack != 'undefined') {
                            let adminonline = false;
                            let lobby = backend.getChannelByID(config.movechannelId);
                            let lobbyclients = lobby.getClients();
                            lobbyclients.forEach(user => {
                                if (isinGroup(user, 100) || isinGroup(user, 6)) adminonline = true;
                            });
                            if (!adminonline) {
                                trackurl = config.OFFLINEtrack["url"];
                                engine.log(ev.client.name() +' - Playback OFFLINE-Track - No Admin in Target-Channel: ' + lobby.name());
                                playtrack (trackurl);
                                msg = 'z.Zt. kein Administrator zur Freigabe verfuegbar !';
                                return;
                            }
                        }

                        OSString = ev.client.getPlatform();
                        if (config.dev) engine.log('OS-Based track used. ' +ev.client.name() + ' uses ' + OSString);
                        if (typeof OSString == 'undefined') {
                            engine.log(ev.client.name() + ' - Error on OS-check or not defined (ABORT)');
                            ev.client.kick('Servererror. Please try again later');
                            return;
                        } else {
                            switch (OSString) {
                                case 'Windows':
                                    trackurl = config.WINtrack["url"] + '&callback=welcomesound&copy=true'; 
                                    if (config.dev) engine.log('Configured Windows Track');                        
                                    break;
                                case 'Android':
                                    trackurl = config.ANDROIDtrack["url"] + '&callback=welcomesound&copy=true';
                                    if (config.dev) engine.log('Configured Android Track');                        
                                    break;
                                case 'Linux':
                                    trackurl = config.LINUXtrack["url"] + '&callback=welcomesound&copy=true';
                                    if (config.dev) engine.log('Configured Linux Track');                        
                                    break;
                                case 'iOS':
                                    trackurl = config.IOStrack["url"] + '&callback=welcomesound&copy=true';
                                    if (config.dev) engine.log('Configured iOS Track');                        
                                    break;
                                default:
                                    if (config.trackunkown) {
                                        trackurl = config.UNKNOWNtrack["url"] + '&callback=welcomesound&copy=true';
                                        engine.log(ev.client.name() + ' - No valid OS found. Play default-OS track');
                                    } else {
                                        ev.client.moveTo(config.movechannelId);
                                    }
                                    break;
                            }      
                        }
                    
                        engine.log(ev.client.name() + ' - Playback ' + OSString + '-Track...');
                        playtrack(trackurl);
                        clientsuccess = true;
                    });
                }
            }
        } else if (fromchannel == config.channelId && (isinGroup(ev.client,config.guestgroup) || isinGroup(ev.client, config.servergroup))) { // && typeof ev.toChannel == 'undefined') {
            if (config.dev) engine.log('Client count: '+ count);
            if (audio.isPlaying() && count == 1) {
                engine.log(ev.client.name() + ' - leaves before ending track');
                count = 0;
                trackurl = undefined;
                OSString = undefined;
                clientsuccess = undefined;
                msg = '';
                media.stop();
                return;
            };
        }
    });
    
    event.on('trackEnd', function(ev, callback) {
            if (config.dev) engine.log('Track ends. Now go on ... (count:' + count + ') - Success: ' +clientsuccess);
            if (typeof user != 'undefined') {

                if (config.OStrack == 0 && count == 1 && clientsuccess) {
                    engine.log(user.name() + ' - has finished playback, move to Channel-ID: ' + config.movechannelId);
                    user.addToServerGroup(config.servergroup);                    
                    user.moveTo(config.movechannelId);
                    //clearvar();
                }
                if (!clientsuccess && msg.length > 1) {
                    if (config.dev) engine.log('Kick User and send: ' + msg);
                    user.poke(msg);
                    user.kick(msg);
                    //clearvar();
                }
            }
            clearvar();
    });

    function clearvar() {
        count = 0;
        trackurl = undefined;
        OSString = undefined;
        clientsuccess = undefined;
        msg = '';
        clearTimeout(timer);
        if (config.dev) engine.log('All variables & TimeoutTimer cleared...');
        return;
    }

    function playtrack(trackurl) {
        if (media.playURL(trackurl)) {
            if (config.dev) engine.log('Timeout-Timer starts with duration:' + (media.getCurrentTrack().duration()+5000) + ' ms.');
            // clientsuccess = true;
            timer = setTimeout(
                function() {
                    count = 0;
                    clientsuccess == undefined;
                    if (config.dev) engine.log('Timer resettet by timeout');
                },
                media.getCurrentTrack().duration()+30000);
        };
    }
    
    function isinGroup(client, id) {
        return client.getServerGroups().some(group => {
        return group.id() == id;
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
});