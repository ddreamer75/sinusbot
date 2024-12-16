registerPlugin({
    name: 'Servergroup Switcher',
    version: '0.6',
    description: 'Removes specific servergroups if another specific ones has been given!',
    author: 'Everlike <admin@everlike.de> | HUGE thaks to Diesmon -> https://forum.sinusbot.com/members/diesmon.3847/ ',
    vars: [
    {
        name: 'removeifisself',
        title: 'Do you also want to automatically remove/add Servergroups if your Bot assigned the Servergroup?',
        type: 'select',
        placeholder: 'yes',
        options: [
        'yes',
        'no'
        ]
    },
    {
        name: 'logOutput',
        title: 'No trigger-logs to engine log',
        type: 'checkbox'
    },
    {
        name: 'serverGroupsRe',
        title: 'General Settings (Remove)',
        type: 'array',
        vars: [
            {
                name: 'sgTrigger',
                title: 'Servergroups that trigger a remove when given',
                indent: 1,
                type: 'strings',
            },
            {
                name: 'sgToRemove',
                title: 'Servergroups to remove',
                indent: 1,
                type: 'strings'
            },
            {
                name: 'OStag',
                title: 'Remove OS-Tag when exists',
                indent: 1,
                type: 'checkbox'
            }

        ]
    },
	{
        name: 'serverGroupsAdd',
        title: 'General Settings (Add)',
        type: 'array',
        vars: [
            {
                name: 'sgTrigger',
                title: 'Servergroups that trigger an add when given',
                indent: 1,
                type: 'strings',
            },
            {
                name: 'sgToAdd',
                title: 'Servergroups to add',
                indent: 1,
                type: 'strings'
            },
            {
                name: 'OStag',
                title: 'Add OS-Tag',
                indent: 1,
                type: 'checkbox'
            }
        ]
    },
    ]
},  function (sinusbot, config) {
 
    var engine = require ('engine');
    var backend = require('backend');
    var event = require ('event');
 
    
    event.on('serverGroupAdded', function(ev)	{
		var removeifisself = config.removeifisself || 0;
		let client = ev.client;
		
		if (ev.invoker.isSelf() && removeifisself == 1) { 
		return
		} 
		else {
			var invoker = ev.invoker.name();
		};
		
		/*  Added by Michael (16.12.2021)
		/*  invoker will be set in client description text
		/* --------------------------- Datum formatieren ----------------------------------*/
		var date = new Date();
		const formatDate = (date)=> {
			let formatted_date = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
			return formatted_date;
		}
		
		/*  User, die nur das Addon "Notification" oder "QRM" bekommen und TOT-Probleme -> vernachlässigen */
		if (ev.serverGroup.id() != 19 && (!hasServerGroupWithID(client, 11)) && (!hasServerGroupWithID(client, 15)) && ev.serverGroup.id() != 113) { /*QRM, vorh. Gateway, vor. Verlinkung */
			if (ev.serverGroup.id() != 104) { /* Notification */
				ev.client.setDescription("Geändert von: >" + invoker + "< (" + formatDate(date) + ") »" + ev.serverGroup.name() + "«")
				event.log("Event startet by: >" + invoker + "< (" + formatDate(date) + ") for client: " + ev.client.name() + " »" + ev.serverGroup.name() + "«")
			}
		}
		
		/*-------------------------------Remove Servergroups-------------------------------*/
        engine.log("Added groupID was: " + ev.serverGroup.id());
        var groupsToRemove = [];
        for (var serverGroup in config.serverGroupsRe) {
            for (var triggerGroup in config.serverGroupsRe[serverGroup].sgTrigger) {
                if (config.logOutput) engine.log("Trigger group ID loop: " + config.serverGroupsRe[serverGroup].sgTrigger[triggerGroup])
                if (ev.serverGroup.id() == config.serverGroupsRe[serverGroup].sgTrigger[triggerGroup]) {
                    if (config.logOutput) engine.log("Old groupsToRemove length: " + groupsToRemove.length)
                    groupsToRemove = groupsToRemove.concat(config.serverGroupsRe[serverGroup].sgToRemove)
                    if (config.serverGroupsRe[serverGroup].OStag) groupsToRemove.push(getPlatform(ev.client));                   
                    if (config.logOutput) engine.log("New groupsToRemove length: " + groupsToRem0ove.length)
                    break;
                }
            }
        }
        for (var group in groupsToRemove) {
            engine.log("Removing ID: " + groupsToRemove[group])
            ev.client.removeFromServerGroup(groupsToRemove[group]);
		}
		/*-------------------------------Add Servergroups-------------------------------*/
		var groupsToAdd = [];
        for (var serverGroup in config.serverGroupsAdd) {
            for (var triggerGroup in config.serverGroupsAdd[serverGroup].sgTrigger) {
                if (config.logOutput) engine.log("Trigger group ID loop: " + config.serverGroupsAdd[serverGroup].sgTrigger[triggerGroup])
                if (ev.serverGroup.id() == config.serverGroupsAdd[serverGroup].sgTrigger[triggerGroup]) {
                    if (config.logOutput) engine.log("Old groupsToAdd length: " + groupsToAdd.length)
                    groupsToAdd = groupsToAdd.concat(config.serverGroupsAdd[serverGroup].sgToAdd)
                    if (config.serverGroupsAdd[serverGroup].OStag) groupsToAdd.push(getPlatform(ev.client)); 
                    if (config.logOutput) engine.log("New groupsToAdd length: " + groupsToAdd.length)
                    break;
                }
            }
        }
        for (var group in groupsToAdd) {
            engine.log("Adding ID: " + groupsToAdd[group])
            ev.client.addToServerGroup(groupsToAdd[group])
        }
    });

    function hasServerGroupWithID(client, id) {
       return client.getServerGroups().some(group => {
          return group.id() == id;
       });
    }

    function getPlatform(client) {
        if (client.getPlatform() == 'Android') return 168;
        if (client.getPlatform() == 'Windows') return 169;
        if (client.getPlatform() == 'Linux') return 170;
    }

});