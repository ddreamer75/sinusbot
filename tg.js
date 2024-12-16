registerPlugin({
    name: "Timed Groups (Modded)",
    version: "0.5",
    description: "Removes specified server group from clients after specified amount of time after assigning",
    author: "DrWarpMan <drwarpman@gmail.com> / Modded by <michael@hertel-wolfhagen.de>",
    backends: ["ts3"],
    engine: ">= 1.0",
/*    autorun: false,
    enableWeb: false,
    hidden: false, */
    requiredModules: [],
    vars: [{
        name: "tgGroups",
        type: "array",
        title: "List of all groups and their times:",
        vars: [{
            name: "groupID",
            type: "string",
            title: "Group ID:"
        }, {
            name: "time",
            type: "number",
            title: "Time (in minutes):"
        }]
    }],
    voiceCommands: []
}, function (_, config, meta) {

    const backend = require("backend");
    const engine = require("engine");
    const event = require("event");
    const store = require("store");

    if (config.tgGroups === undefined)
        return engine.log("No groups defined!");

    let tgGroups = {};
    let time;
    let text = meta.name + ' > ';
    
    // Objekt-Array für VLs
    const vlarray = [{
        uid : 'af+yTbW8g4MbR8NzdPD553RHjfo=', // VL-Funkerfreunde.de
        channel : 2078
    },{
        uid : 'aH9udjeA/FawtR2r3F4F1GYHId0=', // VL-CB-JUNKIES.NL
        channel : 81
    },{
        uid: 'OUpjBjDHRjeFRfZN10UBqprxCMw=', // VL-TEST
        channel : 2081
    },{
        uid: 'sEsZSqWJpJOT7c8wkgpkF/zVT6c=', // VL - GATEWAY NEDERLAND NL
        channel : 81
    }];

    config.tgGroups.forEach(item => {
        if (item.time !== undefined && String(item.time).length > 0) {
            if (!isNaN(item.time)) {
                if (item.time > 0) {
                    if (item.groupID !== undefined && String(item.groupID).length > 0) {
                        if (!isNaN(item.groupID)) {
                            if (item.groupID > 0) {
                                if (!(item.groupID in tgGroups))
                                    tgGroups[item.groupID] = parseInt(item.time) * 60 * 1000;
                                else engine.log(text + "WARN: Found duplicate group ID in configuration!");
                            } else engine.log(text + "WARN: Group ID needs to be higher than 0!");
                        } else engine.log(text + "WARN: Group ID needs to be a number!");
                    } else engine.log(text + "WARN: Found empty group ID in configuration!");
                } else engine.log(text + "WARN: Time needs to be higher than 0!");
            } else engine.log(text + "WARN: Time needs to be a number!");
        } else engine.log(text + "WARN: Found empty time in configuration!");
    });

    event.on("serverGroupAdded", ev => {
        let serverGroupsIDs = Object.keys(tgGroups);
        let serverGroup = ev.serverGroup;
        let client = ev.client;
	    let invoker = ev.invoker.name();
        let msg = backend.getClientByName(invoker);
        var clientGruppe = ev.client.getServerGroups();
        let index = vlarray.findIndex(vl => vl.uid === client.uid());

		var date = new Date();
		const formatDate = (date)=> {
			let formatted_date = date.getHours() + ":" + fuehrendeNull(date.getMinutes());
			return formatted_date;
		}
        
        

        // Added by Michael @ 06.01.2022
        // .

        // Prüfe, ob es ein Gateway(ID:11) oder eine Verlinkung(ID:15) ist, bevor es in den QRM verschoben werden kann!
            
            if (serverGroupsIDs.includes(serverGroup.id()) && ((hasServerGroupWithID(client, 16)) || (hasServerGroupWithID(client, 14)) || (hasServerGroupWithID(client, 18)) || /*(hasServerGroupWithID(client, 22)) ||*/ (hasServerGroupWithID(client, 9)) || (hasServerGroupWithID(client, 100)))) {
                engine.log(text + '!!Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
                ev.client.removeFromServerGroup(ev.serverGroup);
		        msg.poke('User/Smartphones dürfen nicht Stummgeschaltet werden!');
                   
            } else {

            // Verbiete, das jemand Gateways Userrechte zuteilt
            if ((hasServerGroupWithID(client, 11)) && (serverGroup.id() == 16 || serverGroup.id() == 14 || serverGroup.id() == 18)) {
                engine.log(text + 'Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
                ev.client.removeFromServerGroup(ev.serverGroup);
            } else if ((hasServerGroupWithID(client, 15)) && (serverGroup.id() == 16 || serverGroup.id() == 14 || serverGroup.id() == 18)) {
		        engine.log(text + 'Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
             	ev.client.removeFromServerGroup(ev.serverGroup);
	         } else if (hasServerGroupWithID(client, 22) && serverGroup.id() != 19) {
                engine.log(text + 'Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
             	ev.client.removeFromServerGroup(ev.serverGroup);
             }
	    
        }

            // Speichere die vorhandene Client Beschreibung & Weise beim Verschieben in QRM eine "info" zu
            if (serverGroupsIDs.includes(serverGroup.id()) && (hasServerGroupWithID(client, 11) || hasServerGroupWithID(client, 15))) {
                if (store.get(serverGroup.id() + " " + client.uid()) === undefined) {
                    time = parseInt(tgGroups[serverGroup.id()]);
                    // engine.log(text + ' 1. Time is: ' + time);
                    if (store.get("Last:"  + client.uid()) != undefined) {
                        engine.log(text + 'find Last-Timestamp entry for ' + client.name());
                        let key = store.get('Last:' + client.uid());
                        let lasttime = key.substr(0, key.indexOf('|'));
                        let count = key.substr(key.indexOf('|') + 1);
                        if (parseInt(count) == 0 || parseInt(count) == undefined) {
                            count = 1;
                        } else if (parseInt(count) > 3) count = 3;

                        if ((new Date() - new Date(lasttime) <= 300000)) { // Innerhalb von 5 min. erneut in QRM
                            engine.log(text + client.name() + ' becomes ' + (count*15) + 'min. extra');
                            time = (parseInt(tgGroups[serverGroup.id()]) + (+count*(15 * 60 * 1000)));
                        } else {
                            store.unset("Last:" + client.uid());
                        }
                        store.set("Last:" + client.uid(), new Date() + "|" + count);
                    }

                     // CB-Gateways bekommen immer + 30min, wenn Sie KEIN CTCSS oder FM-Select haben
                     // SRV-GRP CB-Gateways: 107
                     // SRV-GRP CTCSS: 182
                     // SRV-GRP FM-Select: 183
                    if (serverGroup.id() == 112 && hasServerGroupWithID(client, 107)) {
                        if (hasServerGroupWithID(client, 182) || hasServerGroupWithID(client, 183)) {
                            // return;
                        } else {
                            time = (time + (30 * 60 * 1000));
                        }

                    }

                    store.set(serverGroup.id() + " " + client.uid(), new Date() + "|" + client.description() + "|" + time);

    	    	    if (hasServerGroupWithID(client, 11)) {
                        client.setDescription("┤" + serverGroup.name() + " von: >" + ev.invoker.name() + "< - " + formatDate(date) + " Uhr für " + parseInt((time/60000)) +"min.├");
                        if (serverGroup.id() == 112 /* || serverGroup.id() == 19 */) { // Servergruppe 19 raus genommen , 21.12.2022
                            client.moveTo(548);
                            engine.log(text + client.name() +" set Disabled by: >" + ev.invoker.name() + "< - " + formatDate(date) + " (" + parseInt((time/60000)) + "min.)");
                        } else if (serverGroup.id() == 165) {
                            client.moveTo(2146);
                            engine.log(text + client.name() +" set Locked by: >" + ev.invoker.name() + "< - " + formatDate(date) + " (" + parseInt((time/60000)) + "min.)");
                        } else {
                            engine.log(text + client.name() +" moved to " + serverGroup.name() + " by: >" + ev.invoker.name() + "< - " + formatDate(date) + " (" + parseInt((time/60000)) + "min.)");
                        }


                    } else {
			        
                        // Movement für VL, behält aber nicht QRM / Stummrechte
                        if (index !== -1 && (serverGroup.id() == 112 /* || serverGroup.id() == 19*/)) { // Servergruppe 19 raus genommen , 21.12.2022
                            engine.log(text + 'QRM/Stumm für ' + client.name() + '; Wird in Ihren Raum verschoben' + " (" + (time/60000) + "min.)");
                            client.moveTo(vlarray[index].channel);
                            ev.client.removeFromServerGroup(ev.serverGroup);
                            return;
                        }
                    }
                }
            }
    });

    event.on("serverGroupRemoved", ev => {
        let serverGroupsIDs = Object.keys(tgGroups);
        let serverGroup = ev.serverGroup;
        let client = ev.client;
		// let gruppe = backend.getServerGroupByID(serverGroup.id());

        // engine.log(text + 'triggert by: ' + ev.invoker.name() + ' for Client: ' + client.name() + ' / Switched SRV-GRP: ' + serverGroup.id());

        if (serverGroupsIDs.includes(serverGroup.id()) && !ev.invoker.isSelf()) {
            if (store.get(serverGroup.id() + " " + client.uid())) {
				let ar = store.get(serverGroup.id() + " " + client.uid());
				let arr = ar.split('|');
                // engine.log(text + ' Stored description for client: ' + client.name() + ' - ' + arr[0] + ' / ' + arr[1] + ' / '  + arr[2]);
				client.setDescription(arr[1]);

                // Test mit QRM (Abschaltung) 112
                if (!ev.invoker.isSelf() && (serverGroup.id() == 112 /*|| serverGroup.id() == 19*/)) { // Servergruppe 19 raus genommen , 21.12.2022
                    client.moveTo(7);
                    engine.log(text + client.name() +" manual moved back in Gateway Raum 1 - by: >" + ev.invoker.name() + "< [Desc: " + arr[1] + "]");
                } else {
				engine.log(text + client.name() +" manual moved back by: >" + ev.invoker.name() + "< [Desc: " + arr[1] + "]");
                }
                store.unset(serverGroup.id() + " " + client.uid());
                store.unset("Last:" + client.uid());
                
            }
        }

        // Special für die neuen Servergruppen 107,108,109,110 (added @ 10.01.2022)
        if ((serverGroup.id() >= 107) && (serverGroup.id() <=110)) {
            ev.client.removeFromServerGroup(serverGroup.id());
            ev.client.removeFromServerGroup(11);
        }

    });

    event.on("connect", ev => {
        setTimeout(checkClients, 10 * 1000);
    });

    setInterval(checkClients, 60 * 1000);
    setInterval(checkGroups, 5 * 1000);


    /**
     * Check every saved client identity and his group time
     */
    function hasServerGroupWithID(client, id) {
        return client.getServerGroups().some(group => {
            return group.id() == id;
        });
    }

    function checkGroups() {
        if (backend.isConnected() === false)
            return;
		/* Probieren, wenn was nicht geht
		let err = store.getKeys();
		engine.log("Stored Keys: " + err); */
		
        store.getKeys().forEach(key => {
            if (key.match('Last:')) return;
			let ar = store.get(key);
			let arr = ar.split('|');
			let dateAdded = new Date(arr[0]);
            let serverGroup = key.substr(0, key.indexOf(' '));
            let uid = key.substr(key.indexOf(' ') + 1);
            let counter = 1;
            time = parseInt(arr[2]);
            if (time == undefined) time = parseInt(tgGroups[serverGroup]);

            if (new Date() - dateAdded >= time) {
                let client = backend.getClientByUID(uid);
				let bot = backend.getBotClient();
                if (client) {
                    client.removeFromServerGroup(serverGroup);
					client.setDescription(arr[1]);

                    // Addon für QRM (Abschaltung) 112
					if (serverGroup == 112) {
                        client.moveTo(7);
                        engine.log(text + client.name() +" automatic moved back to Gateway Raum 1 by: >" + bot.name() +"< [Desc: " + arr[1] + "]");
                    } else {
                    engine.log(text + client.name() +" automatic moved back by: >" + bot.name() +"< [Desc: " + arr[1] + "]");
                    }
                    
                    if (store.get("Last:" + uid)) {
                        let last = store.get("Last:" + uid);
                        counter = last.substr(last.indexOf('|') + 1);
                        if (parseInt(counter) == 0 || parseInt(counter) == undefined) {
                            counter = 1;
                        } else {
                            counter++
                        }
                    }
                    store.unset(key);
                    store.set("Last:" + uid, new Date() + '|' + counter);
                }
            }
        });
    }

    /**
     * Check every client, if doesn't already have a timed server group (useful when for ex. bot disconnects and connects)
     */
    function checkClients() {
        if (backend.isConnected() === false)
            return;

        backend.getClients().forEach(client => {
            let serverGroupsIDs = Object.keys(tgGroups);
            let clientServerGroups = client.getServerGroups();

            clientServerGroups.forEach(group => {
                if (serverGroupsIDs.includes(group.id())) {
                    if (store.get(group.id() + " " + client.uid()) === undefined) {
                        store.set(group.id() + " " + client.uid(), new Date() + "|" + client.description());
                    }
                }
            });
        });
    }

	function fuehrendeNull(zahl) {
		zahl = (zahl < 10 ? '0' : '' )+ zahl;  
		return zahl;
	}
	
    // SCRIPT LOADED SUCCCESFULLY
    engine.log(text + "has loaded successfully..");
});
