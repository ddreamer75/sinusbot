registerPlugin({
    name: "Timed Groups (Modded+Telegram)",
    version: "0.1beta",
    description: "Removes specified server group from clients after specified amount of time after assigning",
    author: "DrWarpMan <drwarpman@gmail.com> / Modded by <michael@hertel-wolfhagen.de>",
    backends: ["ts3"],
    engine: ">= 1.0",
/*    autorun: false,
    enableWeb: false,
    hidden: false, */
    requiredModules: ['http'],
    vars: [
        {
            name: 'token',
            title: 'Telegram Bot Token from @BotFather (https://t.me/BotFather)',
            type: 'password',
            placeholder: ''
        },
        {   name: 'chat_id',
            title: 'Chat-Id für Nachrichten an Telegram',
            type: 'number',
            placeholder: ''
        },
        {
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
    const http = require('http');

    // const MASTER = config.master;
    // 48-131 für Telegram BOT!
    const TOKEN = config.token;
    const chatid = config.chat_id;
    const CLIENT_PREFIX = "  ";
    // Maximum retries after which to top querying.
    const MAX_RETRIES = 5;
    // Interval in which to check for new messages.
    const INTERVAL = 30; // seconds
    // Request Timeout
    const TIMEOUT = INTERVAL;
    
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
                }

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

        return telegram('sendMessage', data);
    }

    if (config.tgGroups === undefined) return engine.log("No groups defined!");    

    let tgGroups = {};

    config.tgGroups.forEach(item => {
        if (item.time !== undefined && String(item.time).length > 0) {
            if (!isNaN(item.time)) {
                if (item.time > 0) {
                    if (item.groupID !== undefined && String(item.groupID).length > 0) {
                        if (!isNaN(item.groupID)) {
                            if (item.groupID > 0) {
                                if (!(item.groupID in tgGroups))
                                    tgGroups[item.groupID] = parseInt(item.time) * 60 * 1000;
                                else engine.log("WARN: Found duplicate group ID in configuration!");
                            } else engine.log("WARN: Group ID needs to be higher than 0!");
                        } else engine.log("WARN: Group ID needs to be a number!");
                    } else engine.log("WARN: Found empty group ID in configuration!");
                } else engine.log("WARN: Time needs to be higher than 0!");
            } else engine.log("WARN: Time needs to be a number!");
        } else engine.log("WARN: Found empty time in configuration!");
    });

    event.on("serverGroupAdded", ev => {
        let serverGroupsIDs = Object.keys(tgGroups);
        let serverGroup = ev.serverGroup;
        let client = ev.client;
	    let invoker = ev.invoker.name();
        let msg = backend.getClientByName(invoker);
        var clientGruppe = ev.client.getServerGroups();

		var date = new Date();
		const formatDate = (date)=> {
			let formatted_date = date.getHours() + ":" + fuehrendeNull(date.getMinutes());
			return formatted_date;
		}
        
        

        // Added by Michael @ 06.01.2022
        // ..

        // Prüfe, ob es ein Gateway(ID:11) oder eine Verlinkung(ID:15) ist, bevor es in den QRM verschoben werden kann!
            
            if (serverGroupsIDs.includes(serverGroup.id()) && ((hasServerGroupWithID(client, 16)) || (hasServerGroupWithID(client, 14)) || (hasServerGroupWithID(client, 18)) || (hasServerGroupWithID(client, 22)) || (hasServerGroupWithID(client, 9)) || (hasServerGroupWithID(client, 100)))) {
                engine.log('!!Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
                ev.client.removeFromServerGroup(ev.serverGroup);
		        msg.poke('User/Smartphones dürfen nicht Stummgeschaltet werden!');
                   
            } else {

            // Verbiete, das jemand Gateways Userrechte zuteilt
            if ((hasServerGroupWithID(client, 11)) && (serverGroup.id() == 16 || serverGroup.id() == 14 || serverGroup.id() == 18)) {
                engine.log('Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
                ev.client.removeFromServerGroup(ev.serverGroup);
            } else if ((hasServerGroupWithID(client, 15)) && (serverGroup.id() == 16 || serverGroup.id() == 14 || serverGroup.id() == 18)) {
		        engine.log('Not allowed action! - Move ' + client.name() + ' to ' + serverGroup.name() + ' by: ' + ev.invoker.name());
             	ev.client.removeFromServerGroup(ev.serverGroup);
	         }
	    
        }

            // Speichere die vorhandene Client Beschreibung & Weise beim Verschieben in QRM eine "info" zu
            if (serverGroupsIDs.includes(serverGroup.id()) && ((hasServerGroupWithID(client, 11)) || (hasServerGroupWithID(client, 15)))) {
                if (store.get(serverGroup.id() + " " + client.uid()) === undefined) {
                    store.set(serverGroup.id() + " " + client.uid(), new Date() + "|" + client.description());
    	    	    client.setDescription("┤" + serverGroup.name() + " von: >" + ev.invoker.name() + "< - " + formatDate(date) + " Uhr├");
			        
                    // Test mit QRM (Abschaltung) 112
                    if (serverGroup.id() == 112) {
                        client.moveTo(548);
			            engine.log(client.name() +" set Disabled by: >" + ev.invoker.name() + "< - " + formatDate(date));
                        sendMessage(chatid, client.name() + ' von (' + ev.invoker.name() + ' in QRM verschoben!');
                    } else {
                        engine.log(client.name() +" moved to " + serverGroup.name() + " by: >" + ev.invoker.name() + "< - " + formatDate(date));
                    }
                }
            }
    });

    event.on("serverGroupRemoved", ev => {
        let serverGroupsIDs = Object.keys(tgGroups);
        let serverGroup = ev.serverGroup;
        let client = ev.client;
		let gruppe = backend.getServerGroupByID(serverGroup.id());

        if (serverGroupsIDs.includes(serverGroup.id())) {
            if (store.get(serverGroup.id() + " " + client.uid())) {
				let ar = store.get(serverGroup.id() + " " + client.uid());
				let arr = ar.split('|');
				client.setDescription(arr[1]);

                // Test mit QRM (Abschaltung) 112
                if (serverGroup.id() == 112) {
                    client.moveTo(7);
                    engine.log(client.name() +" manual moved back in Gateway Raum 1 - by: >" + ev.invoker.name() + "< [Desc: " + arr[1] + "]");
                    sendMessage(chatid, client.name() +" zurück in Gateway Raum 1 geholt von:" + ev.invoker.name());
                } else {
				engine.log(client.name() +" manual moved back by: >" + ev.invoker.name() + "< [Desc: " + arr[1] + "]");
                }
                store.unset(serverGroup.id() + " " + client.uid());
                
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
			let ar = store.get(key);
			let arr = ar.split('|');
			let dateAdded = new Date(arr[0]);
            let serverGroup = key.substr(0, key.indexOf(' '));
            let uid = key.substr(key.indexOf(' ') + 1);
            let time = parseInt(tgGroups[serverGroup]);
			/* let txt = arr.substr(arr.indexOf('|') + 1); */

            if (new Date() - dateAdded >= time) {
                let client = backend.getClientByUID(uid);
				let bot = backend.getBotClient();
                if (client) {
                    client.removeFromServerGroup(serverGroup);
					client.setDescription(arr[1]);

                    // Addon für QRM (Abschaltung) 112
					if (serverGroup == 112) {
                        client.moveTo(7);
                        engine.log(client.name() +" automatic moved back to Gateway Raum 1 by: >" + bot.name() +"< [Desc: " + arr[1] + "]");
                        sendMessage(chatid, client.name() +" automatisch zurück in Gateway Raum 1");
                    } else {
                    engine.log(client.name() +" automatic moved back by: >" + bot.name() +"< [Desc: " + arr[1] + "]");
                    }
                    store.unset(key);
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
    engine.log("\n[Script] \"" + meta.name + "\" [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\"");
});
