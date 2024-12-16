/*
  Tunakill's Rankingsystem
  (C) Simon Beidenhauser, 2017
  This script is licensed under the MIT License
*/

registerPlugin({
  name: 'Ranks',
  version: '0.13.11',
  engine: '>= 0.10.8',
  description: 'Rank system',
  author: 'Simon (info@tunakill.net)',
  license: 'MIT',
    vars: [
      {
        name: 'ranking_enable',
        title: 'Ranking enable',
        type: 'select',
        options: [
          "Enable Ranking",
          "Track only unser online Time"
        ]
      },
      {
        name: 'update_interval',
        title: 'Update interval in minutes',
        type: 'number',
        placeholder: '5'
      },
      {
        name: 'debug',
        title: 'Debug log',
        type: 'select',
        options: [
          "No debug",
          "Only Errors",
          "All debug messages"
        ]
      },
      {
        name: 'onlinetimerequest',
        title: '!onlinetime',
        type: 'select',
        options: [
          "All users are able to see there online time by sending !onlinetime",
          "Disable this function",
        ]
      },
      {
        name: 'onlinetimerequest_message',
        title: '!onlinetime / !ontime message [%name = username, %days = days online, %hours = hours online, %minutes = minutes online, %seconds = seconds online]',
        type: 'string',
        placeholder: 'You were online for [color=green]%days[/color] days [color=green]%hours[/color] hours [color=green]%minutes[/color] minutes and [color=green]%seconds[/color] seconds!',
        conditions: [
						{ field: 'onlinetimerequest', value: 0}
				]
      },
      {
        name: 'set_message',
        title: 'Message after set rankup',
        type: 'select',
        options: [
          "No message",
          "One message for all ranks",
          //"Specific message for every rank"
        ]
      },
      {
        name: 'set_message_type',
        title: 'Message type',
        type: 'select',
        options: [
          "Chat",
          "Poke",
          "Server chat"
        ],
        conditions: [
						{ field: 'set_message', value: 1 }
				]
      },
      {
        name: 'set_message_all',
        title: 'Message after rankup. [%groupname = servergroup name of the new rankgroup, %name = username]',
        type: 'string',
        placeholder: 'Congratulation! You reached [color=red]%groupname[/color].',
        conditions: [
						{ field: 'set_message', value: 1 }
				]
      },
      {
        name: 'server_group_to_set',
        title: 'Add Ranks',
        type: 'array',
        vars: [
          {
            name: 'time_required',
            title: 'Time (in minutes) the user has to be online to get server group',
            type: 'number'
          },
          {
            name: 'server_group',
            title: 'Server group id',
            type: 'number',
          } /*,
          {
            name: 'set_message_specific',
            title: 'Message after rankup. [%groupname = servergroup name of the new rankgroup, %name = username]',
            type: 'string',
            placeholder: 'Congratulation! You are 5 hours online.',
            conditions: [
                { field: 'set_message', value: 1 }
            ]
          } */
        ],
        conditions: [
						{ field: 'ranking_enable', value: 0 }
				]
      },
      {
        name: 'disable_tracking_for_mute',
        title: 'Track muted user',
        type: 'select',
        options: [
          "Track",
          "Don´t track"
        ]
      },
      {
        name: 'disable_tracking_for_deaf',
        title: 'Track deaf user',
        type: 'select',
        options: [
          "Track",
          "Don´t track"
        ]
      },
      {
        name: 'disable_tracking_for_away',
        title: 'Track if user is away',
        type: 'select',
        options: [
          "Track",
          "Don´t track"
        ]
      },
      {
        name: 'channel_to_not_track',
        title: 'Add Channel no track',
        type: 'array',
        vars: [
          {
            title: 'Channel',
            name: 'channel_id',
            type: 'channel'
          }
        ]
      },
      {
        name: 'server_groups_to_not_set_rank',
        title: 'Add servergroup to not set rank group',
        type: 'array',
        vars: [
          { 
            title: 'Servergroup ID',
            name: 'servergroup_id',
            type: 'number'
          }
        ],
        conditions: [
						{ field: 'ranking_enable', value: 0 }
				]
      },
      {
        name: 'server_groups_ranking_whitelist',
        title: 'Servergroup only allowed to Rank (Whitelist, Rankinggroups are included) (If you add any group other groups will not be able to get rankinggroups)',
        type: 'array',
        vars: [
          { 
            title: 'Servergroup ID',
            name: 'servergroup_id',
            type: 'number'
          }
        ],
        conditions: [
						{ field: 'ranking_enable', value: 0 }
				]
      }
    ],
    enableWeb: true
},function(sinusbot, config, info){
  
  var engine = require('engine');
  var backend = require('backend');
  var store = require('store');
  var event = require('event');
  
  
  function debug(message, log_level) {
    
    if(config.debug == 0 || config.debug == undefined) {
      return;
    } else if(config.debug == 1 && log_level != 1) {
      return;
    }
    engine.log('DEBUG: ' + message);
  }
  
  function getServerGroupsConfig() {
    
    var config_server_groups = config.server_group_to_set;
    if(config_server_groups == undefined) {
      debug("No ranks set",12);
      return [];
    }
    
    config_server_groups.sort(function(a, b) {
      return parseFloat(a.time_required) - parseFloat(b.time_required);
    });
    return config_server_groups;
    
  }
  
  function setAllUserTimeToNow() {
    
    var all_user = backend.getClients();
    
    all_user.forEach(function(user) {
      
      setUserTimetrakStart(user.uniqueID());
      
    });
    
  }
  
  function channelToTrackAllowed(channel_id_current) {
    
    var channel_notrack = config.channel_to_not_track;
    
    if(channel_notrack != undefined) {

      for(var zaehler = 0; zaehler < channel_notrack.length; zaehler++) {
        
        if(channel_notrack[zaehler].channel_id == channel_id_current) {
        
          return false;
        
        }
        
      }
      
    }
    return true;
    
  }
  
  function isNotInServerGroup(user_servergroups, servergroup_id) {

    for(var zaehler = 0; zaehler < user_servergroups.length; zaehler++) {
      
      if(user_servergroups[zaehler].id() == servergroup_id) {
      
        return false;
      
      }
      
    }
    
    return true;
    
  }
  
  function getUserCurrentTotalTime(user_uid) {
    
    return store.get("timetrak"+user_uid);
    
  }
  
  function rankGroupToSetDel(user) {
    
    var time_online_total = getUserCurrentTotalTime(user.uniqueID());
    
    var conifg_time = getServerGroupsConfig();
    var server_group_to_set_now = false;
    var server_group_to_del = false;
    var i;
    
    for(i = (conifg_time.length - 1);  i >= 0; i--) {
      
      if(conifg_time[i].time_required * 60 < time_online_total) {
        
        server_group_to_set_now = conifg_time[i].server_group;
        
        if(i != 0) {
          
          server_group_to_del = conifg_time[(i-1)].server_group;
          
        }
        
        break;
      }
      
    }
    
    return {del: server_group_to_del, set: server_group_to_set_now, config_nummer: i};
    
  }
  
  function sendRankupMessage(user, config_nummer, server_group_to_set_now) {
    
    if(config.set_message == 1 || config.set_message == 2) {
      
      var message = "";
      
      if(config.set_message == 1) {
        
        message = config.set_message_all
        
      } else if(config.set_message == 2) {
        
        message = config.server_group_to_set[config_nummer].set_message_specific;
        
      }
      
      if(message.indexOf("%name") != -1) {
        message = message.replace("%name", user.name())
      }
      if(message.indexOf("%groupname") != -1) {
        message = message.replace("%groupname", backend.getServerGroupByID(server_group_to_set_now).name());
      }
      
      if(config.set_message_type == 1) {
        
        user.poke(message);
        
      } else if(config.set_message_type == 2) {
        
        backend.chat(message);
        
      } else {
        
        user.chat(message);
        
      }
      
    }
    
  }
  
  function userWhitelist(user) {
    
    if(config.server_groups_ranking_whitelist != undefined) {
      if(config.server_groups_ranking_whitelist.length != 0) {
        var is_not_in_servergroup = true;
        for(var counter = 0; counter < config.server_groups_ranking_whitelist.length; counter++) {
          if(!isNotInServerGroup(user.getServerGroups(), config.server_groups_ranking_whitelist[counter].servergroup_id)) {
            debug("User is allowed to rank", 10);
            is_not_in_servergroup = false;
            break;
          }
        }
        if(is_not_in_servergroup) {
          for(var counter = 0; counter < config.server_group_to_set.length; counter++) {
            if(!isNotInServerGroup(user.getServerGroups(), config.server_group_to_set[counter].server_group)) {
              debug("User isn´t in the whitelist", 10);
              is_not_in_servergroup = false;
              break;
            }
          }
        }
        if(is_not_in_servergroup) {
          debug("User isn´t in the whitelist", 10);
          return false;
        }
      }
    }
    
    return true;
    
  }
  
  function updateUsersRank(user) {
    
    if(config.ranking_enable == 1) {
      debug("Ranking disabled", 10);
      return;
    }
    
    if(!userWhitelist(user)){
      return;
    }
    
    if(config.server_groups_to_not_set_rank != undefined) {
      for(var zaehler = 0; zaehler < config.server_groups_to_not_set_rank.length; zaehler++) {
        if(!isNotInServerGroup(user.getServerGroups(), config.server_groups_to_not_set_rank[zaehler].servergroup_id)) {
          debug("Ranking disabled for this user (Servergroup)", 10);
          return;
        }
      }
    }
    
    var user_rank = rankGroupToSetDel(user);
    var server_group_to_set_now = user_rank.set;
    var server_group_to_del = user_rank.del;
    
    debug('____________________', 12);
    debug('User Name: ' + user.name(), 12);
    debug('User UID: ' + user.uniqueID(), 12);
    debug('Group to set: ' + server_group_to_set_now, 12);
    debug('Group to del: ' + server_group_to_del, 12);
    
    
    if(server_group_to_set_now) {
      
      if(!isNotInServerGroup(user.getServerGroups(), server_group_to_del)) {
        
        var server_group_dell_return = user.removeFromServerGroup(String(server_group_to_del));
        debug('Remoed from group: ' + server_group_dell_return , 12);
        
        if(server_group_dell_return && isNotInServerGroup(user.getServerGroups(), server_group_to_set_now)) {
          
          var server_group_add_return = user.addToServerGroup(String(server_group_to_set_now));
          debug('Addet to group: ' + server_group_add_return, 12);
          
          if(server_group_add_return) {
            sendRankupMessage(user, user_rank.config_nummer, server_group_to_set_now);
          }
          
        }

      } else if(isNotInServerGroup(user.getServerGroups(), server_group_to_set_now)) {
        
        var server_group_add_return = user.addToServerGroup(String(server_group_to_set_now));
        debug('Addet to group: ' + server_group_add_return, 12);
        
        if(server_group_add_return) {
          sendRankupMessage(user, user_rank.config_nummer, server_group_to_set_now);
        }
        
      }
      
    }
    
    debug('____________________', 12);
    
  }
  
  function setUserTimetrakStart(user_uid) {
    
    var time = Math.round(new Date().getTime() / 1000);
    store.set("startTime"+user_uid, time);
    
  }
  
  function allowedToTrack(client, ignore) {
    
    debug("Ignore: " + ignore, 12);
    debug("Mute: " + client.isMuted(), 12);
    debug("Deaf: " + client.isDeaf(), 12);
    debug("Away: " + client.isAway(), 12);
    
    if(config.disable_tracking_for_mute == 1 && client.isMuted() && ignore !== 0) {
      return false;
    } else if(config.disable_tracking_for_deaf == 1 && client.isDeaf() && ignore !== 1) {
      return false;
    } else if(config.disable_tracking_for_away == 1 && client.isAway() && ignore !== 2) {
      return false;
    }
    if(config.disable_tracking_for_mute == 1 && ignore === 10) {
      return false;
    } else if(config.disable_tracking_for_deaf == 1 && ignore === 11) {
      return false;
    } else if(config.disable_tracking_for_away == 1 && ignore === 12) {
      return false;
    }
    
    return true;
    
  }
  
  function updateUserTimetrak(user, user_channel, ignore) {
    
    debug('____________________', 12);
    debug('User Name: ' + user.name(), 12);
    debug('User UID: ' + user.uniqueID(), 12);
    
    if(channelToTrackAllowed(user_channel) && allowedToTrack(user, ignore)) {
    
      var time = Math.round(new Date().getTime() / 1000);
      
      var user_online_start = store.get("startTime" + user.uniqueID());
      var user_online_time = time - user_online_start;
      var user_online_time_total_old;
      
      if (store.get("timetrak"+ user.uniqueID()) != undefined) {
        
        user_online_time_total_old = store.get("timetrak" + user.uniqueID());
        
      } else {
        
        user_online_time_total_old = 0;
  
      }
      
      var user_online_time_total_new = user_online_time_total_old + user_online_time;
      
      store.set("timetrak" + user.uniqueID(), user_online_time_total_new);
      
      debug("user_online_time_total_new " + user_online_time_total_new , 12);
      
    }
    
    setUserTimetrakStart(user.uniqueID());
    debug('____________________', 12);
    
  }
  
  function updateAllUserList(user) {
    
    user_uid = user.uniqueID(); 
    user_name = user.name()
    var all_user_listed = store.get('allUserListed');
    
    if(all_user_listed == undefined) {
    
      all_user_listed = new Array;
    
    } else {
      
      for(var i_user = 0; i_user < all_user_listed.length; i_user++) {
        
        if(all_user_listed[i_user].uid == user_uid) {
          
          all_user_listed[i_user].name = user_name;
          store.set('allUserListed', all_user_listed);
          return true;
          
        }
        
      }
      
    }
    
    all_user_listed.push({uid: user_uid, name: user_name});
    store.set('allUserListed', all_user_listed);

  }
  
  function delDoubleGroups(user) {
    
    var current_rank = rankGroupToSetDel(user);
    var conifg_time = getServerGroupsConfig();
    
    for(var counter = 0; counter < conifg_time.length; counter++) {
      var server_group_id = conifg_time[counter].server_group
      if(server_group_id != current_rank.set || config.ranking_enable == 1) {
        
        if(!isNotInServerGroup(user.getServerGroups(), server_group_id)) {
          
          user.removeFromServerGroup(String(server_group_id));
          debug("Removed servergroup " + server_group_id, 5);
          
        }
        
      } 
      
    }
    
    
  }
  
  function sendUserOntime(client) {
    
    var message = config.onlinetimerequest_message;
    
    if(message == undefined || message == "") {
      debug("Please set a message for !onlinetime", 3);
      return;
    }
    
    message = message.replace("%name", client.name());
    
    var onlinetime = store.get("timetrak"+ client.uniqueID());
    var days = Math.floor(onlinetime / 86400);
    var hours = Math.floor((onlinetime % 86400) / 3600);
    var minutes = Math.floor((onlinetime % 3600) / 60);
    var seconds = onlinetime % 60;
    
    debug("Online time: " + onlinetime, 12);
    debug("UID: " + client.uniqueID(), 12);
    
    message = message.replace("%days", days);
    message = message.replace("%hours", hours);
    message = message.replace("%minutes", minutes);
    message = message.replace("%seconds", seconds);
    
    debug("Message: " + message, 12);
    
    client.chat(message);  
  }
  
  var update_interval = config.update_interval * 60000;
  if (update_interval < 60000) {
    
    update_interval = 300000;
    debug('Your update interval is to low.', 1);
    
  }
  
  if(backend.isConnected()) {
    
    setAllUserTimeToNow();
    var all_user = backend.getClients();
    all_user.forEach(function(user) {
      
      updateAllUserList(user);
      
    });
    
  }

  setInterval(function(){
    
    if(backend.isConnected()) {
      
      var all_user = backend.getClients();
      
      all_user.forEach(function(user) {
        
        updateUserTimetrak(user, user.getChannels()[0].id(), false);
        updateUsersRank(user);
        
      });
      
    }
  }, update_interval);


  event.on('connect', function(ev) {

    setAllUserTimeToNow();
    
  });

  event.on('clientMove', function(ev) {

    if(ev.fromChannel == undefined) {
      
      updateAllUserList(ev.client);
      setUserTimetrakStart(ev.client.uniqueID());
      delDoubleGroups(ev.client);

    } else {

      updateUserTimetrak(ev.client, ev.fromChannel.id(), false);
      updateUsersRank(ev.client);
      
    }

  });
  
  event.on('clientMute', function(ev) {
    debug(ev.name() + " mute",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 0);
  });
  event.on('clientUnmute', function(ev) {
    debug(ev.name() + " unmute",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 10);
  });
  event.on('clientDeaf', function(ev) {
    debug(ev.name() + " deaf",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 1);
  });
  event.on('clientUndeaf', function(ev) {
    debug(ev.name() + " undeaf",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 11);
  });
  event.on('clientAway', function(ev) {
    debug(ev.name() + " away",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 2);
  });
  event.on('clientBack', function(ev) {
    debug(ev.name() + " back",12);
    updateUserTimetrak(ev, ev.getChannels()[0].id(), 12);
  });
    
  event.on('chat', function(ev) {

    if((ev.text == "!onlinetime" || ev.text == "!ontime")&& config.onlinetimerequest == 0) { 
      sendUserOntime(ev.client);
    }
	
  });
  
  event.on('api:tunakill_rank_info', function(ev) {
    
    return {succes: true, data: info};
    
  });

  event.on('api:tunakill_rank_all_user', function(ev) {

    debug("api: " + ev.data(), 7);
    var all_user = store.get('allUserListed');
    var user_return = new Array;
    
    all_user.forEach(function(user) {
      
      user_return.push({name: user.name, uid: user.uid, time: store.get("timetrak"+ user.uid)});
    
    });
    
    return {succes: true, data: user_return};
    
  });
  
  event.on('api:tunakill_rank_set_user_time', function(ev) {
    
    debug("__________________________", 7);
    
    debug("API data " + JSON.stringify(ev.data()), 12);
    
    var api_data = ev.data();
    
    if(api_data == undefined || api_data.data == undefined) {
      debug("API: Wrong request" , 7);
      debug("__________________________", 7);    
      return {succes: false, error: "Wrong request!"};
    }
    
    var user_uid = api_data.data.uid;
    var new_time = parseInt(api_data.data.time);
    
    if(user_uid == undefined || user_uid == undefined) {
      debug("API: Wrong request" , 7);
      debug("__________________________", 7);    
      return {succes: false, error: "Wrong request!"};
    }
    
    
    setUserTimetrakStart(user_uid);
    store.set("timetrak" + user_uid, new_time);
    
    var server_groups = getServerGroupsConfig();
    var user = backend.getClientByUniqueID(user_uid);
    
    if(user == undefined) {
      debug("API: User is offline. Servergroup will remove later!" , 7);
      debug("__________________________", 7);    
      return {succes: true, message: "User is offline. Servergroup will remove later!"};
    }
    
    var user_servergroups = user.getServerGroups();
   
    debug("API set new user time for:", 7);
    debug("Name: " + user.name(), 7);
    debug("UID: " + user.uniqueID(), 7);
    
    for(var zaehler = 0; zaehler < server_groups.length; zaehler++) {
      
      if(!isNotInServerGroup(user_servergroups, server_groups[zaehler].server_group)) {
        
        debug("Removed servergroup " + server_groups[zaehler].server_group, 7);
        user.removeFromServerGroup(String(server_groups[zaehler].server_group));
        
      }
      
    }
    
    debug("__________________________", 7);
    
    return {succes: true, message: "Time set. Servergroups removed"};
    
  });

});