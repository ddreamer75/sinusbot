registerPlugin({
    name: 'TOT-Eliminator v2',
    version: '2.0',
    description: 'Eliminates Time-Out-Talking problem',
    author: 'Michael H. <michael@hertel-wolfhagen.de>',
    backends: ['ts3'],
    vars: [
        {
            name: 'autorestart',
            title: 'TOT Eliminator setzen',
            type: 'checkbox'
        },
		{
            name: 'Track',
            indent: 2,
            title: 'Play TOT-Sound',
            type: 'track',
        },
		{
            name: 'spacer0',
            title: '',
			conditions: [
                { field: 'autorestart', value: true }
            ]
		},
		{
            name: 'info',
			indent: 2,
			title: 'Alle hier gesetzten Werte müssen im zulässigen Bereich sein. (siehe Klammern). Bei fehlerhafter Eingabe oder "Out-Of-Range"-Settings werden Standardeinstellungen verwendet.',
			conditions: [
                { field: 'autorestart', value: true }
            ]
		},
		{
            name: 'tottime',
            indent: 2,
            title: 'Zeit in Sekunden bis TOT ausgelöst wird (min. 100 / max. 300) - Standard: 150 Sek.',
            type: 'number',
            placeholder: '150',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
		{
            name: 'totpause',
            indent: 2,
            title: 'Zeit in Sekunden für Stummschaltung Channel (min. 1) - Standard: 2 Sek.',
            type: 'number',
            placeholder: '2',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
		{
            name: 'delay',
            indent: 2,
            title: 'Delay in Sekunden zwichen 2 durchgängen (min. 1 / max. 5) - Standard: 2 Sek',
            type: 'number',
            placeholder: '2',
            conditions: [
                { field: 'autorestart', value: true }
            ]
        },
		{
            name: 'spacer1',
            title: '',
			conditions: [
                { field: 'autorestart', value: true }
            ]
		},
		{
            name: 'debug',
            indent: 4,
            title: 'Debug Logging enable',
            type: 'checkbox',
            conditions: [
                { field: 'autorestart', value: true }
            ]

        }
	]
}, function(_, config, meta) {
    var engine = require('engine');
    var media = require('media');
    var event = require('event');
    var backend = require ('backend');
 
	let isSpeaking = false;
	let startTime = null;
	let endTime = null;
	let totalSpeakingTime = 0;
	let lastEndTime = null;
	
	// Setze Variablen gemäß config-page; Bei ungültigen Eingaben werden defaults verwendet
	const MAX_SPEAKING_TIME = (config.tottime < 100 || config.tottime > 300) ? '150000' : config.tottime * 1000; // default: 150 Sek.
	const PAUSE_TIME = (config.delay < 1 || config.delay > 5) ? '2000' : config.delay * 1000; // default: 2 Sek.
	const TOTOUT = (config.totpause < 100 || config.totpause > 300) ? '2000' : config.totpause * 1000; // default: 2 Sek.

	event.on('talkerCount', function (ev) {
		let currentTime = new Date().getTime();
		if (ev >= 1) {
			if (!isSpeaking) {
				// Niemand sprach zuvor, neuer Sprecher beginnt
				isSpeaking = true;
				startTime = currentTime;
				if (config.debug) engine.log('Sprecher hat begonnen.');
				// Setze ein Timeout, um die maximale Sprechzeit zu überwachen 
				setTimeout(function () { 
					if (isSpeaking && (totalSpeakingTime + (new Date().getTime() - startTime) >= MAX_SPEAKING_TIME)) { 
						if (config.debug) engine.log('Maximale Sprechzeit von ' + (MAX_SPEAKING_TIME/1000) + ' sek. im Raum erreicht. Aktion wird ausgeführt.'); 
						totalSpeakingTime = 0; // Setze Zeit wieder zurück
						performAction();
						} 
					}, MAX_SPEAKING_TIME - totalSpeakingTime);

			} else {
				// Aktualisiere die Gesamtsprechzeit
				totalSpeakingTime += currentTime - startTime;
				startTime = currentTime; // Zurücksetzen der Startzeit für den nächsten Durchgang

				if (totalSpeakingTime >= MAX_SPEAKING_TIME) {
					if (config.debug) engine.log('Maximale Sprechzeit im Raum erreicht. Aktion wird ausgeführt.');
					totalSpeakingTime = 0; // Setze Zeit wieder zurück
					performAction();
				}
			}
		} else if (ev == 0) {
			if (isSpeaking) {
				// Sprecher hat aufgehört zu sprechen
				endTime = currentTime;
				isSpeaking = false;
				totalSpeakingTime += endTime - startTime;
				lastEndTime = currentTime;
				if (config.debug) engine.log('Sprecher hat aufgehört zu sprechen. Gesamte Sprechzeit: ' + (totalSpeakingTime/1000) + ' Sekunden.');

				// Setze ein Timeout für die Pausezeit
				setTimeout(function () {
					if (!isSpeaking) {
						if ((new Date().getTime() - lastEndTime) >= PAUSE_TIME) {
							// Pausezeit eingehalten
							totalSpeakingTime = 0;
							if (config.debug) engine.log('Pausezeit von ' + (PAUSE_TIME/1000) + ' Sekunden eingehalten. Neuer Sprecher kann beginnen.');
						} else {
							// Falls die Pausezeit nicht eingehalten wird, zählt die Zeit zur Gesamtsprechzeit
							totalSpeakingTime += PAUSE_TIME;
							if (config.debug) engine.log('Pausezeit von ' + (PAUSE_TIME/1000) + ' Sekunden NICHT eingehalten. Zeit wird aufaddiert!');
							if (totalSpeakingTime >= MAX_SPEAKING_TIME) {
								if (config.debug) engine.log('Maximale Sprechzeit von ' + (MAX_SPEAKING_TIME/1000) + ' Sekunden im Raum erreicht. Aktion wird ausgeführt.');
								totalSpeakingTime = 0; // Setze Zeit wieder zurück
								performAction();
							}
						}	
					}
				}, PAUSE_TIME);
			}
		}
	});

	function performAction() {
		var channel = backend.getCurrentChannel();
		engine.log('TOT-Ausgelöst. Aktion wird ausgeführt.');
		if (media.playURL(config.Track["url"])) {
			channel.update({
				neededTalkPower: 5000, // Setze 'needetTalkPower' auf 5000 um Channel zu stumm zu schalten
			});
			if (config.debug) engine.log('...neededTalkPower wird auf 5000 erhöht.');
			setTimeout(function () {
				channel.update({
					neededTalkPower: 10,
				});
				if (config.debug) engine.log('neededTalkPower wurde auf 10 zurückgesetzt.');
			}, TOTOUT); // Setze 'neededTalkPower' nach x-Sekunden auf 10 zurück um Sprechen zu ermöglichen
		}
	}
	
	
	// SCRIPT LOADED SUCCCESFULLY
    engine.log("\n\"" + meta.name + "\" - [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\" erfolgreich geladen.");
	engine.log("\n\"" + meta.name + "\" - [Max-Zeit] \"" + (MAX_SPEAKING_TIME/1000) + "\" sek. [Delay] \"" + (PAUSE_TIME/1000) + "\" sek. [Mute-Zeit] \"" + (TOTOUT/1000) + "\" sek.");
	if (config.debug) engine.log("\n\"" + meta.name + "\" - [DEBUG ENABLED]");
});