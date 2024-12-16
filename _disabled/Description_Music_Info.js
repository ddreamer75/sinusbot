/*
 * Copyright (C) 2020 Akutasan <real.akutasan@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/*
 *
 * @author Akutasan <real.akutasan@gmail.com>
 *
 */
 registerPlugin({
   name: 'Display Music in Channel Description',
   version: '0.1',
	 engine: '>= 0.9.16',
	 backends: ['ts3'],
	 description: 'This script enables you to display your Music (Artist and Title) in your Channel description.',
	 author: 'Akutasan <real.akutasan@gmail.com>',
	 vars: [
     {
       name: 'theChannel',
       indent: 1,
       title: 'Channel for Description',
       type: 'channel'
     },
     {
       name: "OnlineText",
       indent: 1,
       title: 'Online Text: (%Artist% = Artist, %Title% = Title)',
       type: 'multiline',
       placeholder: '[center][size=15]%Artist% by %Title%[/size][/center]'
     },{
       name: "OfflineText",
       indent: 1,
       title: 'Offline Text:',
       type: 'multiline',
       placeholder: '[center][size=15]Music Offline![/size][/center]\n'
     }
   ]
 }, function(sinusbot, config) {
   //Includes
   var engine = require('engine');
   var backend = require('backend');
   var event = require('event');
   var audio = require('audio');
   var media = require('media');

   var descCh = backend.getChannelByID(config.theChannel);
   var ttl;
   var notFound = '';
   var delay = true;
   var Txt = '';
   var count = 0;
   var OnlineText = config.OnlineText;
   var OfflineText = config.OfflineText;

   // if (typeof config.OfflineText == 'undefined' || config.OfflineText == '') {
   //   var desc = '[center][size=15]Music Offline![/size][/center]\n';
   // } else {
   //   var desc = config.OfflineText;
   // }
   // if (typeof config.OnlineText == 'undefined' || config.OnlineText == '') {
   //   var desc = '[center][size=15]%Artist% by %Title%[/size][/center]\n';
   // } else {
   //   var desc = config.OnlineText;
   // }

   // updatedelay for no-spamming
 	// function updatedelay() {
 	// 	delay = false;
 	// 	setTimeout(
 	// 		function() {
 	// 			delay = true;
 	// 			chUpdate(media.getCurrentTrack());
 	// 		}, 30000
 	// 	);
 	// }

  //Check if Music is playing
  event.on('trackEnd', function(ev) {
		setTimeout(
			function() {
				if (!audio.isPlaying()) {
          descCh.update({description: OfflineText});
          engine.log('Channel description changed! | Title = "" | Artist = ""');
          engine.log('Music Status is "Stopped"');
				}
			}, 5000
		);
	});

  event.on('trackInfo', function(ev) {
		if (delay == true) {
			chUpdate(ev);
			// updatedelay();
		}
	});

  event.on('connect', function(ev) {
		descCh = backend.getChannelByID(config.theChannel);
	});

  function chUpdate(track){
    //Check for Title
    if (typeof track.tempTitle() != 'undefined' && track.tempTitle() != '') {
			var tt = track.tempTitle();
			ttl = track.tempTitle();
		} else if (track.title() != 'undefined' && track.title() != '') {
			var tt = track.title();
			ttl = track.title();
		} else {
			var tt = notFound;
      count = 1;
		}

    //Check for artist
    if (typeof track.tempArtist() != 'undefined' && track.tempArtist() != '') {
      var ta = track.tempArtist();
      tal = track.tempArtist();
    } else if (track.artist() != 'undefined' && track.artist() != '') {
      var ta = track.artist();
      tal = track.artist();
    } else if (typeof track.album() != 'undefined' && track.album() != '') {
      var ta = track.album();
    } else {
      var ta = notFound;
      if (count == 1) {
        count = 3;
      } else {
        count = 2;
      }
    }

    // if (count == 1) {
    //   tt = '';
    // } else if (count == 2) {
    //   ta = '';
    // } else if (count == 3) {
    //   tt = '';
    //   ta = '';
    //   Txt = OfflineText;
    //   engine.log('Channel description changed! | Title = "" | Artist = ""');
    //   engine.log('Music Status is "Stopped"');
    // } else {
      Txt = OnlineText.replace('%Artist%', ta).replace('%Title%', tt);
      engine.log('Channel description changed! | Title = "' + ta + '" | Artist = "' + tt + '"');
      engine.log('Music Status is "Playing"');
    // }


    if (audio.isPlaying()) {
      descCh.update({description: Txt});
    }
  }

  chUpdate(media.getCurrentTrack());

 });
