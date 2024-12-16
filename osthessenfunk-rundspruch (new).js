registerPlugin({
    name: "Osthessenfunk Channel-Updater",
    version: "0.2",
    description: "Automatic Updates URL and Channel description for Osthessenfunk",
    author: "Michael 13MHW75 <michael@hertel-wolfhagen.de>",
    backends: ["ts3"],
    engine: ">= 1.0",
    requiredModules: ['http'],
    vars: [
        {
            name: 'telegraminfo',
            title: 'Informationen / Update via TelegramBOT senden',
            type: 'checkbox'
        },
        {
            name: 'token',
            indent: 2,
            title: 'Telegram Bot Token from @BotFather (https://t.me/BotFather)',
            type: 'password',
            placeholder: '',
            conditions: [
                { field: 'telegraminfo', value: true }
            ]
        },
        {   name: 'chat_id',
            indent: 2,
            title: 'Chat-Id für Nachrichten an Telegram',
            type: 'number',
            placeholder: '',
            conditions: [
                { field: 'telegraminfo', value: true }
            ]
        },
        {
            name: 'debug',
            title: 'Enable debug',
            type: 'checkbox'
        },/*{
            name: 'restart',
            title: 'Allow user to send "!restart" instruction. (Only possible, if 1 listener in channel)',
            type: 'checkbox'
        } */ // Zur Zeit nicht impementiert
    ]}, function (_, config, meta) {

    const backend = require("backend");
    const engine = require("engine");
    const media = require("media");
    const audio = require("audio");
    const store = require("store");
    const http = require('http');
    
    // ** Zur Zeit nicht impementiert !
    // const event = require("event");

    const monat = ['Januar','Februar','Maerz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    var description = "[center][b].·´¯`·-> Rundspruch vom %month% <-·´¯`[/b]\n\n[IMG]https://www.gateway-deutschland.de/pics/Wasserkuppe.png[/IMG]\n\nDer Rundspruch von der Wasserkuppe mit bundesweiten, sowie regionalen Informationen und Terminen aus der Welt der Funk- und Kommunikationstechnik, wird  jeden 1. Samstag im Monat um 20 Uhr auf CB-Funk Kanal 61 FM (26.765 MHz) gesendet.\n\nDie Moderation und Redaktion unterliegt Markus von\n[URL]www.osthessenfunk.de[/URL]";
    var playmonth = null;

    // Telegram needed variables 
    const TOKEN = config.token;
    const chatid = config.chat_id;
    const INTERVAL = 30; 
    const TIMEOUT = INTERVAL;
    var telegrammessage = "[.](https://www.gateway-deutschland.de/pics/Wasserkuppe.png)*Osthessen-Rundspruch aktualisiert.\nNeu: %id%*";
    var interval ='';
    // 

    if (config.telegraminfo) {
        if (!TOKEN) {
            engine.log('Please set the Telegram Bot Token in the script config.');
            engine.notify('Please set the Telegram Bot Token in the script config.');
            return;
        }
    
        let bot;
        telegram('getMe').then(user => { bot = user; }).catch(err => {
            engine.log(`Error on getMe: ${err}`);
        });

        // clear webhook
        telegram('setWebhook', {
            url: '',
        }).catch(err => {
            engine.log(`Error while clearing webhook: ${err}`);
        });
    }

    
    waitForBackend(10,3)
    .then(() => {
        var channel = backend.getCurrentChannel();
        if (channel.id() != 94) return engine.log("Ooops, it's not the Osthessenfunk Channel! -- STOPPED");

        // SCRIPT LOADED SUCCCESFULLY
        engine.log("\n[Script] \"" + meta.name + "\" [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\"");
        main();
    })

    // Restartfunktion nicht implementiert
    /* event.on('chat', function (ev) {
        if (!config.restart) return;
        var text = ev.text;
        var client = ev.client;
        var channel = backend.getCurrentChannel();
        
        if (text.toLowerCase() == '!restart') {
            if (channel.getClientCount() == 2) {
                if (config.debug) {
                    engine.log('User: ' + client.name() + ' sends restart instruction.');
                }
                playstream(new Date(), true);
            } else {
                client.poke('Neustart nur möglich, wenn Sie alleine den Stream hören!');
                if (config.debug) {
                    engine.log('User: ' + client.name() + ' sends "restart" but ignore in case of too many listeners!');
                }
            }
        }
    }) */

    function main() {
        interval = setInterval(function() {
            var datum = new Date();
            if (!audio.isPlaying()) {
                if (config.debug) engine.log('Function main: No audio is playing...');
                if (!playstream(datum)) {
                    if (config.debug) engine.log('date: ' + monat[datum.getMonth()] + ' not online ... checking if possible to get url with month: ' + monat[datum.getMonth()-1]);
                    datum.setMonth(datum.getMonth()-1);
                };
                playstream(datum);
                clearInterval(interval);
                main();
            };
        }, 60000);
    }

    function playstream (datum, restart) {   
        var channel = backend.getCurrentChannel();     
        var url = 'https://www.osthessenfunk.de/Audio/Rundspruch_' + monat[datum.getMonth()] + '_' + datum.getFullYear() + '.mp3';
        if (audio.isPlaying()) {
            if (config.debug) engine.log('Current playing: ' + media.getCurrentTrack().url() + ' @Pos: ' + audio.getTrackPosition() + ' sec.');
            return;
        } else {
            if (config.debug) engine.log('Start playing: ' + url + ' || ' + fulldate(datum));
        };

        if (media.playURL(url)) {
            engine.log('Playback-URL: ' + url);
        
            let lastmonth = store.get('lastmonth');
            if (typeof lastmonth == 'undefined' || lastmonth !== datum.getMonth()) {
                // Update Channel description
                channel.setDescription(description.replace("%month%", monat[datum.getMonth()]));
                //playmonth = datum.getMonth();
                store.set('lastmonth', datum.getMonth());
                engine.log("UPDATE: Osthessenfunk Rundspruch -- Übertragung vom: " + monat[datum.getMonth()] + " '" + datum.getFullYear());
                if (config.telegraminfo) {
                    engine.log('Sende Telegramm an:' + config.chat_id + ' - ' + telegrammessage.replace("%id%", monat[datum.getMonth()] + " '" + datum.getFullYear()));
                    sendMessage(config.chat_id, telegrammessage.replace("%id%", monat[datum.getMonth()] + " '" + datum.getFullYear()), 'Markdown');
                };
            };
            return true;
        } else return false;
    }
    
    function fulldate(datum) {
        var fulldate = fuehrendeNull(datum.getDate()) + fuehrendeNull(datum.getMonth() + 1) + datum.getFullYear();
        return fulldate;
    }

    function fuehrendeNull(zahl) {
		zahl = (zahl < 10 ? '0' : '' )+ zahl;  
		return zahl;
	}

    function telegram(method, data=null) {
        return new Promise((resolve, reject) => {
            http.simpleRequest({
                method: 'POST',
                url: `https://api.telegram.org/bot${TOKEN}/${method}`,
                timeout: TIMEOUT * 1000,
                body: data != null ? JSON.stringify(data) : data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }, (error, response) => {
                // check for lower level request errors
                if (error) {
                    return reject(error);
                }
                
                // check if status code is OK (200)

                if (response.statusCode != 200) {
                    switch (response.statusCode) {
                        case 400: reject('Bad Request. Either an invalid configuration or error in the code.'); break;
                        case 401: reject('Invalid Bot Token'); break;
                        case 404: reject('Invalid Bot Token or Method'); break;
                        default: reject(`Unexpected status code: ${response.statusCode}`);
                    }
                    return;
                } else if (config.debug) engine.log('TELEGRAM Message send to chat-id: ' + config.chat_id);

                // parse JSON response
                var res;
                try {
                    res = JSON.parse(response.data.toString());
                } catch (err) {
                    engine.log(err.message || err);
                }
                
                // check if parsing was successfull
                if (res === undefined) {
                    return reject("Invalid JSON");
                }

                // check for api errors
                if (!res.ok) {
                    engine.log(response.data.toString());
                    return reject(`API Error: ${res.description || 'unknown'}`);
                }
                
                // success!
                resolve(res.result);
            });
        });
    }

    function sendMessage(chat, text, mode=null) {
        let data = {
            'chat_id': chat,
            'text':  text,
        };

        if (mode) data.parse_mode = mode;
        if (config.debug) engine.log('...parsing message, mode: ' + mode);

        return telegram('sendMessage', data);
    }

    function waitForBackend(attempts, wait) {
        return new Promise((success, fail) => {
            let attempt = 1;
            const timer = setInterval(() => {
                if (backend.isConnected()) {
                    clearInterval(timer);
                    if (config.debug) engine.log('waitForBackend() took ' + attempt + ' attempts with a timer of ' + wait + ' seconds to resolve');
                    success();
                    return;
                } else if (attempt > attempts) {
                    clearInterval(timer);
                    if (config.debug) engine.log('waitForBackend() failed at ' + attempt + '. attempt with a timer of ' + wait + ' seconds');
                    fail('backend');
                    return;
                }

                attempt++;
            }, wait * 1000);
        });
    }	
});