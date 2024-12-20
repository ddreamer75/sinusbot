registerPlugin({
    name: 'Digital Clock',
    version: '1.8',
    description: '4-line Digital Clock',
    author: 'Patryk Lesiecki <lostigeros@outlook.com>, JS-Port by Michael Friese <michael@sinusbot.com>',
    vars: {
        id1: {
            title: 'Channel for Line #1',
            type: 'channel'
        },
        id2: {
            title: 'Channel for Line #2',
            type: 'channel'
        },
        id3: {
            title: 'Channel for Line #3',
            type: 'channel'
        },
        id4: {
            title: 'Channel for Line #4',
            type: 'channel'
        },
		id5: {
            title: 'Channel for day, month and year',
            type: 'channel'
        },
		dateformat: {
			title: 'Date format',
			type: 'select',
			options: [
				'DD.MM.YYYY',
				'MM.DD.YYYY',
				'YYYY.MM.DD',
				'YYYY.DD.MM'
			]
		},
		interval: {
			title: 'Update interval',
			type: 'number',
			placeholder: '1'
		},
		style: {
			title: 'Font style',
			type: 'select',
			options: [
				'Style 1 (LosTigeros)',
				'Style 2 (kapabac)',
				'Style 3 (kapabac)',
				'Style 4 (kapabac)',
				'Style 5 (kapabac)',
				'Style 6 (kapabac)',
				'Style 7 (kapabac)',
				'Style 8 (kapabac)',
				'Style 9 (kapabac)',
				'Style 10 (kapabac)',
				'Style 11 (kapabac)',
				'Style 12 (kapabac)',
				'Style 13 (kapabac)',
				'Style 14 (kapabac)',
				'Style 15 (kapabac)'
			]
		},
		spaces: {
			title: 'Spacing',
			type: 'select',
			options: [
				'Style 1 (LosTigeros)',
				'Style 2 (Niggolo)',
				'Style 3 (kapabac)',
				'Style 4 (pix0wl)',
                'Style 5 (pix0wl)',
                'Style 6 (pix0wl)',
				'Style 7 (LosTigeros)',
				'Style 8 (LosTigeros)',
				'Style 9 (LosTigeros)',
				'Style 10 (LosTigeros)',
				'Style 11 (LosTigeros)'
			]
		},
		format: {
			title: 'Format',
			type: 'select',
			options: [
				'24h',
				'12h'
			]
		},
		digits: {
			title: 'Digits',
			type: 'select',
			options: [
				'1-digit (0:00)',
				'2-digits (00:00)'
			]
		},
		timezone: {
            title: 'Time zone',
            type: 'select',
            options: [
                'UTC-12:00',
                'UTC-11:00',
				'UTC-10:00',
				'UTC-09:30',
				'UTC-09:00',
				'UTC-08:00',
				'UTC-07:00',
				'UTC-06:00',
				'UTC-05:00',
				'UTC-04:30',
				'UTC-04:00',
				'UTC-03:30',
				'UTC-03:00',
				'UTC-02:00',
				'UTC-01:00',
				'UTC±00:00',
				'UTC+01:00',
				'UTC+02:00',
				'UTC+03:00',
				'UTC+03:30',
				'UTC+04:00',
				'UTC+04:30',
				'UTC+05:00',
				'UTC+05:30',
				'UTC+05:45',
				'UTC+06:00',
				'UTC+06:30',
				'UTC+07:00',
				'UTC+08:00',
				'UTC+08:30',
				'UTC+08:45',
				'UTC+09:00',
				'UTC+09:30',
				'UTC+10:00',
				'UTC+10:30',
				'UTC+11:00',
				'UTC+12:00',
				'UTC+12:45',
				'UTC+13:00',
				'UTC+14:00'
            ]
        },
		summerTime: {
			title: "Is Summer Time now?",
			type: "select",
			options: ['No','Yes']
		}
    }
}, function(meta, config) {
	var engine = require('engine');
	
	if (!config || !config.id1 || !config.id2 || !config.id3 || !config.id4) {
		engine.log("Digital Clock v1.8 is not configured yet. Disabling it...");
		return;
	}
	
	var backend = require('backend');

	waitForBackend(10, 3)
    	.then(() => {
            log('The script has loaded successfully!');
			checkconfig();
        })
        .catch(error => {
            if (error === 'backend') {
    			log('The bot was not able to connect to the backend in time! To use this script, the bot needs to be connected to your TeamSpeak server. Make sure it can connect. Deactivating script...');
            } else {
                log('Unknown error occured! Please report this to the script author: https://discord.com/invite/Q3qxws6');
                console.log(error);
            }
		});
	

	function checkconfig() {
		if (backend.getChannelByID(config.id1) === undefined) {
			engine.log("Channel for Line #1 doesn't exists! Disabling Digital Clock v1.8...");
			return;
		} else if (backend.getChannelByID(config.id2) === undefined) {
			engine.log("Channel for Line #2 doesn't exists! Disabling Digital Clock v1.8...");
			return;
		} else if (backend.getChannelByID(config.id3) === undefined) {
			engine.log("Channel for Line #3 doesn't exists! Disabling Digital Clock v1.8...");
			return;
		} else if (backend.getChannelByID(config.id4) === undefined) {
			engine.log("Channel for Line #4 doesn't exists! Disabling Digital Clock v1.8...");
			return;
		} else if (config.id5 && backend.getChannelByID(config.id5) === undefined) {
			engine.log("Channel for day, month and year doesn't exists! Disabling Digital Clock v1.8...");
			return;
		}
	}
	
	
    if(config.style == 0) {
		var font = [
			['█▀▀▀█─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '█▀▀▀█─', '█▀▀▀█─', '▄▀▀▀▄─', '█▀▀▀█─', '────'],
			['█───█─', '▀─█─', '───▄▀─', '──▄▄█─', '─▄▀─█──', '█▄▄▄──', '█─────', '────█─', '▀▄▄▄▀─', '█▄▄▄█─', '─▀──'],
			['█───█─', '──█─', '─▄▀───', '────█─', '█▄▄▄█▄─', '────█─', '█▀▀▀█─', '────█─', '█───█─', '────█─', '────'],
			['█▄▄▄█─', '──█─', '█▄▄▄▄─', '▀▄▄▄▀─', '────█──', '▀▄▄▄▀─', '█▄▄▄█─', '────█─', '▀▄▄▄▀─', '█▄▄▄█─', '─▀──']
		];
	} else if(config.style == 1) {
		var font = [
            ['▄▀▀▀▄─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '▄▀▀▀▄─', '▀▀▀▀█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '────'],
            ['█───█─', '▀─█─', '───▄▀─', '──▄▄▀─', '─▄▀─█──', '█▄▄▄──', '█▄▄▄──', '────█─', '▀▄▄▄▀─', '█───█─', '─▀──'],
            ['█───█─', '──█─', '─▄▀───', '────█─', '█▄▄▄█▄─', '────█─', '█───█─', '──▄▀──', '█───█─', '─▀▀▀█─', '────'],
            ['▀▄▄▄▀─', '──█─', '█▄▄▄▄─', '▀▄▄▄▀─', '────█──', '▀▄▄▄▀─', '▀▄▄▄▀─', '──█───', '▀▄▄▄▀─', '▀▄▄▄▀─', '─▀──']
        ];
	} else if(config.style == 2) {
		var font = [
            ['▄▀▀█▄─', '─▄█─', '▄▀▀█▄─', '▄▀▀█▄─', '───▄█──', '██▀▀▀─', '▄█▀▀▄─', '▀▀▀██─', '▄▀▀█▄─', '▄▀▀█▄─', '─▄──'],
            ['█──██─', '▀██─', '───█▀─', '──▄█▀─', '─▄▀██──', '██▄▄──', '██▄▄──', '───██─', '▀▄▄█▀─', '█──██─', '─▀──'],
            ['█──██─', '─██─', '─▄▀───', '───██─', '█▄▄██▄─', '───██─', '██──█─', '──▄█──', '█──██─', '─▀▀██─', '─▄──'],
            ['▀▄▄█▀─', '─██─', '██▄▄▄─', '▀▄▄█▀─', '───██──', '▀▄▄█▀─', '▀█▄▄▀─', '──██──', '▀▄▄█▀─', '▀▄▄█▀─', '─▀──']
        ];
	} else if(config.style == 3) {
		var font = [
            ['█▀▀▀█─', '─█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
            ['█▄▄██─', '██─', '██▄▄▄─', '▄▄▄██─', '───██─', '▄▄▄██─', '██▄▄█─', '───██─', '█▄▄██─', '▄▄▄██─', '─▀──']
        ];
	} else if(config.style == 4) {
		var font = [
            ['█▀▀▀█─', '▀█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '────'],
            ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█───█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█───█─', '─▀──'],
            ['█───█─', '─█─', '█─────', '────█─', '▀▀▀▀█─', '────█─', '█───█─', '────█─', '█───█─', '▀▀▀▀█─', '────'],
            ['█▄▄▄█─', '─█─', '█▄▄▄▄─', '▄▄▄▄█─', '────█─', '▄▄▄▄█─', '█▄▄▄█─', '────█─', '█▄▄▄█─', '▄▄▄▄█─', '─▀──']
        ];
	} else if(config.style == 5) {
		var font = [
            ['█▀▀██─', '██─', '▀▀▀██─', '▀▀▀██─', '█──██─', '██▀▀▀─', '██▀▀▀─', '▀▀▀██─', '█▀▀██─', '█▀▀██─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
            ['█▄▄██─', '██─', '██▄▄▄─', '▄▄▄██─', '───██─', '▄▄▄██─', '██▄▄█─', '───██─', '█▄▄██─', '▄▄▄██─', '─▀──']
        ];
	} else if(config.style == 6) {
		var font = [
            ['▄▀▀▀█─', '▄█─', '─▀▀▀█─', '─▀▀▀█─', '▄───█─', '▄▀▀▀▀─', '▄▀▀▀▀─', '▄▀▀▀█─', '▄▀▀▀█─', '▄▀▀▀█─', '────'],
            ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█───█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█───█─', '─▀──'],
            ['█───█─', '─█─', '█─────', '────█─', '▀▀▀▀█─', '────█─', '█───█─', '────█─', '█───█─', '▀▀▀▀█─', '────'],
            ['█▄▄▄▀─', '─█─', '█▄▄▄──', '▄▄▄▄▀─', '────█─', '▄▄▄▄▀─', '█▄▄▄▀─', '────█─', '█▄▄▄▀─', '▄▄▄▄▀─', '─▀──']
        ];
	} else if(config.style == 7) {
		var font = [
            ['▄▀▀██─', '▄█─', '─▀▀██─', '─▀▀██─', '▄──██─', '▄█▀▀▀─', '▄█▀▀▀─', '▄▀▀██─', '▄▀▀██─', '▄▀▀██─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
            ['█▄▄█▀─', '██─', '██▄▄──', '▄▄▄█▀─', '───██─', '▄▄▄█▀─', '██▄▄▀─', '───██─', '█▄▄█▀─', '▄▄▄█▀─', '─▀──']
        ];
	} else if(config.style == 8) {
		var font = [
            ['▄▀▀▀▄─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '▄▀▀▀▄─', '▀▀▀▀█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '────'],
            ['█───█─', '▀─█─', '───▄▀─', '──▄▄▀─', '─▄▀─█──', '▀▀▀▀▄─', '█▄▄▄──', '────█─', '▀▄▄▄▀─', '▀▄▄▄█─', '─▀──'],
            ['█───█─', '──█─', '─▄▀───', '▄───█─', '▀▀▀▀█▀─', '▄───█─', '█───█─', '──▄▀──', '█───█─', '▄───█─', '─▄──'],
            ['─▀▀▀──', '──▀─', '▀▀▀▀▀─', '─▀▀▀──', '────▀──', '─▀▀▀──', '─▀▀▀──', '──▀───', '─▀▀▀──', '─▀▀▀──', '────']
        ];
	} else if(config.style == 9) {
		var font = [
            ['▄▀▀█▄─', '─▄█─', '▄▀▀█▄─', '▄▀▀█▄─', '───▄█──', '██▀▀▀─', '▄█▀▀▄─', '▀▀▀██─', '▄▀▀█▄─', '▄▀▀█▄─', '─▄──'],
            ['█──██─', '▀██─', '───█▀─', '──▄█▀─', '─▄▀██──', '▀▀▀█▄─', '██▄▄──', '───██─', '▀▄▄█▀─', '▀▄▄██─', '─▀──'],
            ['█──██─', '─██─', '─▄█───', '▄──██─', '▀▀▀██▀─', '▄──██─', '██──█─', '──▄█──', '█──██─', '▄──██─', '─▄──'],
            ['─▀▀▀──', '─▀▀─', '▀▀▀▀▀─', '─▀▀▀──', '───▀▀──', '─▀▀▀──', '─▀▀▀──', '──▀▀──', '─▀▀▀──', '─▀▀▀──', '─▀──']
        ];
	} else if(config.style == 10) {
		var font = [
            ['█▀▀▀█─', '─█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
            ['▀▀▀▀▀─', '▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '─▀──']
        ];
	} else if(config.style == 11) {
		var font = [
            ['█▀▀▀█─', '▀█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '────'],
            ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█▄▄▄█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█▄▄▄█─', '─▀──'],
            ['█───█─', '─█─', '█─────', '────█─', '────█─', '────█─', '█───█─', '────█─', '█───█─', '────█─', '─▄──'],
            ['▀▀▀▀▀─', '─▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────']
        ];
	} else if(config.style == 12) {
		var font = [
            ['█▀▀██─', '██─', '▀▀▀██─', '▀▀▀██─', '█──██─', '██▀▀▀─', '██▀▀▀─', '▀▀▀██─', '█▀▀██─', '█▀▀██─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
            ['▀▀▀▀▀─', '▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '─▀──']
        ];
	} else if(config.style == 13) {
		var font = [
            ['▄▀▀▀█─', '─█─', '─▀▀▀█─', '─▀▀▀█─', '▄───█─', '▄▀▀▀▀─', '▄▀▀▀▀─', '▄▀▀▀█─', '▄▀▀▀█─', '▄▀▀▀█─', '────'],
            ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█▄▄▄█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█▄▄▄█─', '─▀──'],
            ['█───█─', '─█─', '█─────', '────█─', '────█─', '────█─', '█───█─', '────█─', '█───█─', '────█─', '─▄──'],
            ['▀▀▀▀──', '─▀─', '▀▀▀▀──', '▀▀▀▀──', '────▀─', '▀▀▀▀──', '▀▀▀▀──', '────▀─', '▀▀▀▀──', '▀▀▀▀──', '────']
        ];
	} else if(config.style == 14) {
		var font = [
            ['▄▀▀██─', '▄█─', '─▀▀██─', '─▀▀██─', '▄──██─', '▄█▀▀▀─', '▄█▀▀▀─', '▄▀▀██─', '▄▀▀██─', '▄▀▀██─', '─▄──'],
            ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
            ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
            ['▀▀▀▀──', '▀▀─', '▀▀▀▀──', '▀▀▀▀──', '───▀▀─', '▀▀▀▀──', '▀▀▀▀──', '───▀▀─', '▀▀▀▀──', '▀▀▀▀──', '─▀──']
        ];
	}
	
	var tz = [-12,-11,-10,-9.5,-9,-8,-7,-6,-5,-4.5,-4,-3.5,-3,-2,-1,0,1,2,3,3.5,4,4.5,5,5.5,5.75,6,6.5,7,8,8.5,8.75,9,9.5,10,10.5,11,12,12.75,13,14];
	var data = 0;
	
	function updateDate() {
		if(config.id5) {
			var nonutc = new Date();
			if(data != nonutc.getDate()) {
				data = nonutc.getDate();
				var utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
				var time = new Date(utc + (3600000*tz[config.timezone]));
				var ddd = "DD";
				var mmm = "MM";
				var yyyy = "YYYY";
				
				if (config.summerTime == 1) {
					time.setHours(time.getHours() + 1);
				}
				
				if(time.getMonth() <= 8 && config.digits == 1) {
					mmm = "0" + (time.getMonth() + 1);
				} else {
					mmm = (time.getMonth() + 1);
				}
				
				if(time.getDate() <= 9 && config.digits == 1) {
					ddd = "0" + time.getDate();
				} else {
					ddd = time.getDate();
				}
				
				yyyy = time.getFullYear();
				
				var czas = "[cspacer]";
	
				if(config.dateformat == 0) { //DD.MM.YYYY
					czas += ddd + "." + mmm + "." + yyyy;
				} else if(config.dateformat == 1) { //MM.DD.YYYY
					czas += mmm + "." + ddd + "." + yyyy;
				} else if(config.dateformat == 2) { //YYYY.MM.DD
					czas += yyyy + "." + mmm + "." + ddd;
				} else if(config.dateformat == 3) { //YYYY.DD.MM
					czas += yyyy + "." + ddd + "." + mmm;
				}
				
				var channel = backend.getChannelByID(config.id5);
				channel.update({ name: czas });
			}
		}
	};
	updateDate();
	
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

	function log(message) {
		engine.log(meta.name + ' > ' + message);
	}


    function updateClock() {
		var nonutc = new Date();
        var utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
		var time = new Date(utc + (3600000*tz[config.timezone]));
		var hours = 0;
		
		if (config.summerTime == 1) {
			time.setHours(time.getHours() + 1);
		}
		
        if(config.format == 0) {
			hours = time.getHours();
		} else if (config.format == 1) {
			hours = time.getHours() % 12 || 12;
		}
        var minutes = time.getMinutes();
        var lines = ['', '', '', ''];
        for (var i = 0; i < 4; i++) {
			lines[i] = '[cspacer]' + String.fromCharCode(9472);
            if (hours >= 10) {
                lines[i] += font[i][Math.floor(hours / 10)];
            } else {
				if(config.digits == 1) {
					lines[i] += font[i][0];
				}
			}
            lines[i] += font[i][hours % 10];
            lines[i] += font[i][10]; // :
            lines[i] += font[i][Math.floor(minutes / 10)];
            lines[i] += font[i][minutes % 10];
			if (config.spaces == 1) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(9617));
			} else if (config.spaces == 2) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(9552));
			} else if (config.spaces == 3) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(126));
			} else if (config.spaces == 4) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(43));
			} else if (config.spaces == 5) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(61));
			} else if (config.spaces == 6) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10303));
			} else if (config.spaces == 7) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10294));
			} else if (config.spaces == 8) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10240));
			} else if (config.spaces == 9) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10495));
			} else if (config.spaces == 10) {
				lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(11501));
			} else if (config.spaces == 11) {
				//lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(32));
			}
        }

		var channel_id1 = backend.getChannelByID(config.id1);
		var channel_id2 = backend.getChannelByID(config.id2);
		var channel_id3 = backend.getChannelByID(config.id3);
		var channel_id4 = backend.getChannelByID(config.id4);
		
		//Channel update
		channel_id1.update({ name: lines[0] });
		channel_id2.update({ name: lines[1] });
		channel_id3.update({ name: lines[2] });
		channel_id4.update({ name: lines[3] });
    };
    updateClock();
	
	var inter = 1;
	if(config.interval) {
		inter = config.interval;
	}
	var old = 0;
	setInterval(function() {
		var now = new Date();
		if (now.getMinutes() != old) {
            old = now.getMinutes();
			updateDate();
            updateClock();
        }
	}, inter * 1000);
	
	engine.log("Digital Clock v1.8 has been initialized...");
});