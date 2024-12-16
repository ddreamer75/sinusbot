// <reference path="../types.d.ts" />
registerPlugin({
    name: 'Schedule Music Timer (mod)',
    backends: ['ts3', 'discord'],
    version: '1.0d',
    engine: '>= 1.0.0',
    description: 'Play music on a time, move clients with TOT problem, change Description on Channel',
    author: 'Filtik <filtik@gmx.net> / Modded by <michael@hertel-wolfhagen.de>',
    vars: {
        Tracks: {
            title: 'Playing Timers',
            type: 'array',
            vars: [
                {
                    name: 'Track',
                    title: 'Play Track',
                    type: 'track'
                },
                {
                    name: 'Time',
                    title: 'Play Track Time',
                    type: 'strings',
                    // placeholder: '14:00,18:26,11:22,12:59,00:11'
                },
                {
                    name: 'EveryDay',
                    title: 'Play Track Day',
                    type: 'select',
                    options: ["every day", "custom"]
                },
                {
                    name: 'Days',
                    title: 'Days - 1 = Sun, 2 = Mon, 3 = Tues, 4 = Wed, 5 = Thurs, 6 = Fri, 7 = Sat',
                    type: 'strings',
                    // placeholder: '5,1,2',
                    conditions: [
                        { field: 'EveryDay', value: 1 }
                    ]
                },                               
                {
                    name: 'modenable',
                    title: 'Enable modifications',
                    type: 'checkbox'
                },
                {
                    name: 'preAudioEnable',
                    title: 'Play pre-Audio Track',
                    type: 'checkbox',
                    conditions: [
                        { field: 'modenable', value: true }
                    ]
                },
                {
                    name: 'preAudioTrack',
                    title: 'Track to play before MainTrack',
                    type: 'track',
                    indent: 2,
                    conditions: [
                        { field: 'preAudioEnable', value: true }
                    ]
                },
                {
                    name: 'tempDescription',
                    indent: 2,
                    title: 'Custom channel topic while playing tracks',
                    type: 'string',
                    conditions: [
                        { field: 'modenable', value: true }
                    ]
                },
                {
                    name: 'tot',
                    indent: 2,
                    title: 'Prevent Radios from TOT (moving)',
                    type: 'checkbox',
                    conditions: [
                        { field: 'modenable', value: true }
                    ]
                },
                {
                    name: 'muteAll',
                    indent: 2,
                    title: 'Mutes all clients in BOTs channel, while track is playing',
                    type: 'checkbox',
                    conditions: [
                        { field: 'modenable', value: true }
                    ]
                }
            ]
        },
    }
}, function (_, config, meta) {
    var engine = require('engine');
    var backend = require('backend');
    var event = require('event');
    var media = require('media');
	var audio = require('audio');
    var store = require('store');
    var CheckTime = 0;
    var CheckTimeTemp = 0;
    var PlaySong;
    var NextTrack = null;
    var NextTrackTime = '';
    var TrackPlayed = true;
    var TrackPlayedTime = new Date();
    var TrackArray = [];
    var totenable = false;
    var muteall = false;
    var newtopic = null;
    var modenable = false;
    var preAudioEnable = false;
    var preAudioTrack = 'undefined';
    var queue = [];

    function startup() {
        for (var num in config.Tracks) {
            if (config.Tracks[num].Time == '' || typeof config.Tracks[num].Time == 'undefined') {
                engine.log("ERROR: No time in " + num + " seted - STOPP");
                return;
            }
            if (config.Tracks[num].Track == '' || typeof config.Tracks[num].Track == 'undefined') {
                engine.log("ERROR: No track in " + num + " seted - STOPP");
                return;
            }
            if (config.Tracks[num].EveryDay == '' || typeof config.Tracks[num].EveryDay == 'undefined') {
                engine.log("WARN: No concret play day in " + num + " seted - play every day");
            }
            else if (config.Tracks[num].EveryDay == '1') {
                if (config.Tracks[num].Days == '' || typeof config.Tracks[num].Days == 'undefined') {
                    engine.log("ERROR: No play day in " + num + " seted - STOPP");
                    return;
                }
            }
        }
        for (var conf in config.Tracks) {
            var totenable = config.Tracks[conf].tot || false;
            var muteall = config.Tracks[conf].muteAll || false;
            var newtopic = config.Tracks[conf].tempDescription || 'undefined';
            var modenable = config.Tracks[conf].modenable || false;
            var preAudioEnable = config.Tracks[conf].preAudioEnable || false;
            if (preAudioEnable) var preAudioTrack = config.Tracks[conf].preAudioTrack["url"]; else var preAudioTrack = 'undefined';
            // engine.log(config.Tracks[conf].EveryDay);
            if (config.Tracks[conf].EveryDay == '0') {
                for (var i = 0; i <= 6; i++) {
                    var stimes = config.Tracks[conf].Time;
                    stimes.forEach(times => { //(var times in stimes) {
                        //var sttimes = stimes[times];
                        var res = times.split(':');
                        var time = new TrackDate();
                        time.Day = i;
                        if (!parseInt(res[0])) return; 
                        time.Hour = res[0];
                        time.Minute = res[1] || "00";
                        var newTrack = new Nexttrack();
                        newTrack.DateTime = time;
                        newTrack.Title = config.Tracks[conf].Track["title"];
                        newTrack.URL = config.Tracks[conf].Track["url"];
                        newTrack.muteAll = muteall;
                        newTrack.totenable = totenable;
                        newTrack.newtopic = newtopic;
                        newTrack.modenable = modenable;
                        newTrack.preAudioEnable = preAudioEnable;
                        newTrack.preAudioTrack = preAudioTrack;
                        TrackArray.push(newTrack);
                    });
                }
            }
            if (config.Tracks[conf].EveryDay == '1') {
                // engine.log('Bedingung erfüllt');
                var splitdays = config.Tracks[conf].Days;
                // engine.log(splitdays);
                //for (var days in splitdays) {
                splitdays.forEach(days =>{
                    //var stdays = splitdays[days];
                    var stdays = days;
                    // if (stdays == new Date().getDay() + 1) {
                        var stimes = config.Tracks[conf].Time;
                        stimes.forEach(times => {
                            //var sttimes = stimes[times];
                            var res = times.split(':');
                            var time = new TrackDate();
                            time.Day = parseInt(stdays);
                            if (!parseInt(res[0])) return;  
                            time.Hour = res[0];
                            time.Minute = res[1] || "00";
                            var newTrack = new Nexttrack();
                            newTrack.DateTime = time;
                            newTrack.Title = config.Tracks[conf].Track["title"];
                            newTrack.URL = config.Tracks[conf].Track["url"];
                            newTrack.muteAll = muteall;
                            newTrack.totenable = totenable;
                            newTrack.newtopic = newtopic;
                            newTrack.modenable = modenable;
                            newTrack.preAudioEnable = preAudioEnable;
                            newTrack.preAudioTrack = preAudioTrack;
                            TrackArray.push(newTrack);
                        })
                    // }
                })
            }
        }
        TrackArray.sort((a, b) => a - b);
        engine.log(meta.name + ' - V' + meta.version + ' has loaded succesfully.');
        setInterval(checkNextTrack, 5000);
    }
    function checkNextTrack() {
        // engine.log('Triggert ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds());
        TrackArray.forEach(function (track) {
            if (track.DateTime.Day != new Date().getDay() + 1)
                return;
            var splittettimes = track.DateTime.Hour + ":" + track.DateTime.Minute;
            CheckTimeTemp = getMiliTime(splittettimes);
            if (CheckTimeTemp > 0) {
                if (TrackPlayedTime.getMinutes() != new Date().getMinutes() && TrackPlayed) {
                    CheckTime = CheckTimeTemp;
                    TrackPlayed = false;
                }
                if (CheckTimeTemp < CheckTime) {
                    CheckTime = CheckTimeTemp;
                    NextTrack = track;
                    PlaySong = track.Title;
                    NextTrackTime = splittettimes;
                }
            }
        });
        if (NextTrack == null)
            return;
        //if (CheckTime > 0)
        //	engine.log('Next Track "' + PlaySong + '" at ' + NextTrackTime + '. This is in ' + CheckTime + 'ms');
        if (new Date().getHours() != NextTrack.DateTime.Hour)
            return;
        if (new Date().getMinutes() != NextTrack.DateTime.Minute)
            return;
        if (TrackPlayed)
            return;
        playTrack(NextTrack);
    }
    function playTrack(track) {
        if (backend.isConnected) {
			var channel = backend.getCurrentChannel();
            var clients = channel.getClients();
            if (track.totenable) ('TOT prevention for this track is ENABLED'); else engine.log('TOT prevention for this track is DISABLED');
            if (track.modenable) {
                clients.forEach(client => {
                    let isServerGroup = client.getServerGroups().some(group => {
                    return group.id() == 113
                    });
                    // store.set(client.uid(), channel.id() + "|" + client.uid() + "|" + channel.topic());
                    if (isServerGroup) {
                        if (track.totenable) {
                            engine.log('Client ' + client.name() + ' with TOT problem found. Move temopary to empty channel');
                            store.set(client.uid(), channel.id() + "|" + client.uid());
                            client.moveTo(762);
                        }            
                        // store.set(client.uid(), channel.id() + "|" + client.uid() + "|" + channel.topic());
                        // engine.log(store.get(client.uid()));
                    }
                    // store.set(client.uid(), channel.id() + "|" + client.uid() + "|" + channel.topic());
                });
                if (typeof track.newtopic !== 'undefined' || track.muteAll) {
                    engine.log('Set temp. Channel-Permissions');
                    store.set('talkpower', 10);
                    channel.update({
				        neededTalkPower: 5000,
			        });
                }
			    if (typeof track.newtopic !== 'undefined' ) {
                    engine.log('Set temp. channel topic to: ' + track.newtopic);
                    store.set('topic', channel.topic());
                    channel.update({
				        topic: track.newtopic,
		            });
                }
            }
            if (track.preAudioTrack && track.preAudioEnable) {
                engine.log('Playback pre-Audio, then PLAY MUSIC "' + track.Title + '"');
                // store.set('action', false);
                store.set('nexttrack',track.URL);
                media.playURL(track.preAudioTrack);


            } else {
                media.playURL(track.URL);
                // store.set('action', true);
                engine.log('PLAY MUSIC "' + track.Title + '"');
            }

            NextTrack = null;
            NextTrackTime = '';
            TrackPlayed = true;
            TrackPlayedTime = new Date();
		}
    }
  
	event.on('trackEnd', function (ev) {
        if (!store.get('nexttrack') || store.get('nexttrack') == 'undefined') {
            //store.get('action') == true) {
            //store.unset('action');
		    var channel = backend.getCurrentChannel();
            for (var num in config.Tracks) {
                if (config.Tracks[num].modenable) {
                    if (store.get('topic')) {
                        engine.log('Restore Channel-Topic to: ' + store.get('topic'));
                        channel.update({topic: store.get('topic')});
                        store.unset('topic');
                    }
                    if (store.get('talkpower')) {// || config.Tracks[num].muteAll) {
                        engine.log('Restore Talkpower');
                        // channel.update({neededTalkPower: store.get('talkpower')});
                        channel.update({neededTalkPower: store.get('talkpower')});
                        store.unset('talkpower');
                    }

                    if (config.Tracks[num].tot) {
                        store.getKeys().forEach(key => {
                            let ar = store.get(key);
                            let arr = ar.split('|');
                            let uid = arr[1];
                            let channelId = arr[0];
                            let client = backend.getClientByUID(uid);

                            client.moveTo(channelId);
                            engine.log('Client ' + client.name() + ' move back to current channel (' + channelId + ')');
                        
                            store.unset(key);
                        });
                    }
                }
            }
        } else {
            media.playURL(store.get('nexttrack'));
            store.unset('nexttrack');
        }
    });

    event.on('chat', event => {
        if (event.text == '!showMusic') {
            engine.log(TrackArray);
        }
    })

    function getMiliTime(playtime) {
        var res = playtime.split(':');
        var d = new Date();
        d.setHours(res[0]);
        d.setMinutes(res[1]);
        d.setSeconds(0);
        d.setMilliseconds(0);
        var n = d.getTime() - Date.now();
        return n;
    }
    var Nexttrack = /** @class */ (function () {
        function Nexttrack() {
        }
        return Nexttrack;
    }());
    var TrackDate = /** @class */ (function () {
        function TrackDate() {
        }
        return TrackDate;
    }());
    startup();
});
