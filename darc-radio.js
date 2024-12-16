registerPlugin({
    name: "DARC Radio Channel-Updater)",
    version: "0.1",
    description: "Automatic Updates URL and Channel description for DARC Radio",
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
        },{
            name: 'restart',
            title: 'Allow user to send "!restart" instruction. (Only possible, if 1 listener in channel)',
            type: 'checkbox'
        }
    ]}, function (_, config, meta) {

    const backend = require("backend");
    const engine = require("engine");
    const media = require("media");
    const audio = require("audio");
    const event = require("event");
    const http = require('http');

    // var channel = backend.getCurrentChannel();
    // if (channel.id() != 93) return engine.log("Ooops, it's not the DARC-Radio Channel! -- STOPPED");

    var lastdate = null;

    // Telegram needed variables 
    const TOKEN = config.token;
    const chatid = config.chat_id;
    const INTERVAL = 30; 
    const TIMEOUT = INTERVAL;
    var telegrammessage = "[.](https://www.gateway-deutschland.de/pics/DARC_Radio.jpg)*DARC Radio aktualisiert.\nTransmission ID: %id%*";
    // 

    waitForBackend(10,3)
    .then(() => {
        var channel = backend.getCurrentChannel();
        if (channel.id() != 93) return engine.log("Ooops, it's not the DARC-Radio Channel! -- STOPPED");

        // SCRIPT LOADED SUCCCESFULLY
        engine.log("\n[Script] \"" + meta.name + "\" [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\"");
        main();
    })

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

    event.on('chat', function (ev) {
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
    })

    function main() {
        const intervall = setInterval(function() {
            var datum = new Date();
            let tag = datum.getDay();
            var channel = backend.getCurrentChannel();
            if (tag == 0 && lastdate != fulldate(datum)) {
                engine.log ('Updated DARC-Radio Channel (' + fulldate(datum) + ')');
                let description = '[center][b].·´¯`·-> Transmission #' + (kw(datum) + 359) + ' <-·´¯`\n(' + datum.getDate() + '.' + fuehrendeNull(datum.getMonth() +1) + '.' + datum.getFullYear() + ')\n\n[/b][IMG]https://www.gateway-deutschland.de/pics/DARC_Radio.jpg[/IMG]\n\n[size=12][b][u]Was ist RADIO DARC ?[/u][/b][/size]\nUnter dem Motto "Von Funkamateuren für Funkamateure" wird wöchentlich auf diesem Sendeplatz ein regelmässiges DX- und Technik-Magazin ausgestrahlt, welches in ganz Europa gut zu empfangen ist. Aktuelle Meldungen aus dem Amateurfunk- und Kurzwellenbereich, Marktberichte, Technik-Tipps, DX-Meldungen und Interviews erwarten die Hörer ebenso wie abwechslungsreiche Musik aus den "goldenen" 70er und 80er Jahren. Unsere Sendungen verfolgen auch einen Informations- und Bildungsauftrag für die Öffentlichkeit. Die Programme sind in Anlehnung an die Machart früherer See-Sender wie Radio Noordzee International, Radio Veronica und Radio Caroline produziert. RADIO DARC ist in dieser lockeren Magazinform praktisch einzigartig weltweit und mittlerweile eines der letzten noch verbliebenen Kurzwellenprogramme überhaupt, welches in Deutschland produziert wird. Lang- und Mittelwelle ist bereits seit 2015 leider Geschichte.';
                channel.setDescription(description);
                if (config.telegraminfo) {
                    engine.log('Sende Telegramm an:' + config.chat_id + ' - ' + telegrammessage.replace("%id%", (kw(datum) + 359)));
                    sendMessage(config.chat_id, telegrammessage.replace("%id%", (kw(datum) + 359)), 'Markdown');
                };
                lastdate = fulldate(datum);       
                playstream(datum);
                clearInterval(intervall);
                main();
            }

            if (!audio.isPlaying()) {
                var datum = new Date(datum.getFullYear(), datum.getMonth(), (datum.getDate() - tag));
                playstream(datum);
                clearInterval(intervall);
                main();
            }
        }, 10000);
    }

    function playstream (datum, restart) {        
        var url = 'http://www.alximedia.de/radio/DARC-Radio-' + fulldate(datum) + '-59min.mp3';
        if (audio.isPlaying() && !restart) {
            if (config.debug) engine.log('Current playing: ' + media.getCurrentTrack().url() + ' @Pos: ' + audio.getTrackPosition() + ' sec.');
            return;
        } else {
            if (config.debug) engine.log('Start playing: ' + url + ' || ' + fulldate(datum));
        }
        // audio.setRepeat(true);
        lastdate = fulldate(datum);
        if (media.playURL(url)) engine.log('Playback-URL: ' + url);
    }
    
    function fulldate(datum) {
        var fulldate = fuehrendeNull(datum.getDate()) + fuehrendeNull(datum.getMonth() + 1) + datum.getFullYear();
        return fulldate;
    }

    function kw(date) {
        var date = new Date(date);
        var currentThursday = new Date(date.getTime() +(3-((date.getDay()+6) % 7)) * 86400000);
        var yearOfThursday = currentThursday.getFullYear();
        var firstThursday = new Date(new Date(yearOfThursday,0,4).getTime() +(3-((new Date(yearOfThursday,0,4).getDay()+6) % 7)) * 86400000);
        var weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000/7);
        return weekNumber;
    }
    
    function fuehrendeNull(zahl) {
		zahl = (zahl < 10 ? '0' : '' )+ zahl;  
		return zahl;
	}

    function checkconfig() {
        if (config.staticurl != undefined) {
            if (config.staticurl.length > 7) {
                if (!isNaN(config.expire)) {
                    if (config.expire > 0 && config.expire <= 12) {
                        engine.log('Use static-URL: ' + config.staticurl + ' for KW' + config.expire);
                        return true;
                    } else return false;
                } else return false;
            } else return false;
        } else return false;
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