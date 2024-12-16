registerPlugin({
    name: "Osthessenfunk Automatik",
    version: "0.1",
    description: "Automatische Wiedergabe von Osthessenfunk-Rundspruch jeden ersten Sonntag im Monat 19:00Uhr",
    author: "Michael 13MHW75 <michael@hertel-wolfhagen.de>",
    backends: ["ts3"],
    engine: ">= 1.0",
    vars: [
        {
            name: 'debug',
            title: 'Enable debug',
            type: 'checkbox'
        }
    ]}, function (_, config, meta) {

    const backend = require("backend");
    const engine = require("engine");
    const media = require("media");
    const audio = require("audio");
    const event = require("event");
    const store = require("store");


    // define variables
    // Array mit den Monaten
    var lastdate = null;
    var monat = ['Januar','Februar','Maerz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    var osthessenfunk = null;

    waitForBackend(10,3)
    .then(() => {

        // SCRIPT LOADED SUCCCESFULLY
        engine.log("\n[Script] \"" + meta.name + "\" [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\"");
        setInterval(main, 10000);
    })

    event.on('trackEnd', function (ev) {
        var channel = backend.getCurrentChannel();
        if (osthessenfunk) {
            channel.update({topic: 'Gateway-Kanal 1'});
            channel.update({neededTalkPower: 10});
            store.getKeys().forEach(key => {
                let clientuid = key;
                let oldchannel = store.get(key);
                let client = backend.getClientByUID(clientuid);
                engine.log('Client: ' + client.name() + ' moved Back to Gateway Raum 1');
                client.moveTo(oldchannel);
                store.unset(key);
            });

            osthessenfunk = undefined;
        };
    });
    
    function main() {
        var datum = new Date();
        var channel = backend.getCurrentChannel();
        var clients = channel.getClients();
        if (firstsatureday(datum) && datum.getHours() == 19 && lastdate != fulldate(datum)) {
            channel.update({topic: 'Osthessenfunk playback...'});
            channel.update({neededTalkPower: 100});
            clients.forEach(client => {
                let isServerGroup = client.getServerGroups().some(group => {
                    return group.id() == 113
                    });
                if (isServerGroup) {
                    engine.log('Client ' + client.name() + ' with TOT problem found. Move temopary to empty channel');
                    store.set(client.uid(), channel.id());
                    client.moveTo(762);
                };
            });
            playstream(datum); } 
        else return;
        }

    function firstsatureday(datum) {
        let wochentag = datum.getDay();
        let tag = datum.getDate();
        // if (wochentag == 0 && tag <=6) return true; else return false;
        if (wochentag == 0 && tag <= 6) return true; else return false;
        }
    
    function playstream (datum) {        
        var url = 'https://www.osthessenfunk.de/Audio/Rundspruch_' + monat[datum.getMonth()] + '_' + datum.getFullYear() + '.mp3';
        if (audio.isPlaying()) {
            if (config.debug) engine.log('Current playing: ' + media.getCurrentTrack().url() + ' @Pos: ' + audio.getTrackPosition() + ' sec.');
            return;
        } else {
            if (config.debug) engine.log('Start playing: ' + url + ' || ' + fulldate(datum));
        }
        // audio.setRepeat(true);
        lastdate = fulldate(datum);
        if (media.playURL(url)) {
            engine.log('Playback-URL: ' + url);
            osthessenfunk = true;
            lastplayback = fulldate(datum);
        }
    }   
    
    function fulldate(datum) {
        var fulldate = fuehrendeNull(datum.getDate()) + fuehrendeNull(datum.getMonth() + 1) + datum.getFullYear();
        return fulldate;
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
                    if (config.dev) log('waitForBackend() took ' + attempt + ' attempts with a timer of ' + wait + ' seconds to resolve');
                    success();
                    return;
                } else if (attempt > attempts) {
                    clearInterval(timer);
                    if (config.dev) log('waitForBackend() failed at ' + attempt + '. attempt with a timer of ' + wait + ' seconds');
                    fail('backend');
                    return;
                }

                attempt++;
            }, wait * 1000);
        });
    }
    }	
);