// <reference path="../types.d.ts" />
registerPlugin({
    name: 'Mass disabler (mod)',
    backends: ['ts3', 'discord'],
    version: '1.0d',
    engine: '>= 1.0.0',
    description: 'Change Talkpower on specified servergroups',
    author: 'Michael Hertel <michael@hertel-wolfhagen.de>',
    vars: {
        Gruppe: {
            title: 'Servergruppern / Gateway abschalter',
            type: 'array',
            vars: [
                {
                    name: 'Name',
                    title: 'Name',
                    type: 'string',
                    placeholder: 'CB-Gateways ein-/ausschalten'
                },
                {
                    name: 'ServergroupId',
                    title: 'Servergruppen ID, welche getriggert werden sollen',
                    type: 'number',
                },
                {
                    name: 'CommandOff',
                    title: 'Anstups-Befehl, mit dem die Ausschalt-Aktion ausgeführt wird',
                    type: 'string',
                    placeholder: 'cb-aus'
                },
                {
                    name: 'CommandOn',
                    title: 'Anstups-Befehl, mit dem die Einschalt-Aktion ausgeführt wird',
                    type: 'string',
                    placeholder: 'cb-an'
                },
                {
                    name: 'Time',
                    title: 'Zeit in Minuten, wie lange die Abschaltung andauert, bis die AKtion wieder rückgaängig gemacht wird',
                    type: 'number',
                    placeholder: '30'
                },                               
                {
                    name: 'CustomTime',
                    title: 'Abschaltzeit (Minuten) in Nachricht berücksichtigen/n<size=8>(die o.a. Zeit wird dadurch ignoriert)</size>',
                    type: 'checkbox'
                },
            ]
        },
    }
}, function (_, config, meta) {
    var engine = require('engine');
    var backend = require('backend');
    var event = require('event');
    var store = require('store');
    var Topicchange = true;
    var counter = 0;
    
    function startup() {
        for (var num in config.Gruppe) {
            /* if (config.Gruppe[num].ServergroupId == '' || typeof config.Gruppe[num].ServergroupId == 'undefined') {
                engine.log("ERROR: No Servergroup in " + num + " seted - STOPP");
                return;
            } */
            if (config.Gruppe[num].Time == '' || typeof config.Gruppe[num].Time == 'undefined') {
                engine.log("ERROR: No default time in " + num + " seted - STOPP");
                return;
            }
            if (config.Gruppe[num].CommandOff == '' || typeof config.Gruppe[num].CommandOff == 'undefined') {
                engine.log("ERROR: No Off-Command in " + num + " seted - STOPP");
                return;
            }
            if (config.Gruppe[num].CommandOn == "" || typeof config.Gruppe[num].CommandOn == 'undefined') {
                engine.log('WARN: No On-Command in ' + num + ' seted - Group only disabling by time');
            }
                
        };
    };

    event.on('poke', function(msg) {
        // message = msg.toLowerCase();
        engine.log('Poked: ' + msg.text + ' from: ' + msg.client.name());
        var message = msg.text.toLowerCase();
        if (msg.text.indexOf(',')) {
            text = msg.text.split(',');
            message = text[0].toLowerCase();
            messagetime = parseInt(text[1]);
        };
        engine.log ('Nachricht war: ' + message);
        for (var num in config.Gruppe) {
            if (config.Gruppe[num].CommandOff.toLowerCase() == message) {
                if (config.Gruppe[num].CustomTime && !isNaN(messagetime)) {
                    disable(config.Gruppe[num].ServergroupId,messagetime,msg.client.name(),config.Gruppe[num].Name);
                    } else {
                    disable(config.Gruppe[num].ServergroupId,config.Gruppe[num].Time,msg.client.name(),config.Gruppe[num].Name);
                    };
                }
            
            if (config.Gruppe[num].CommandOn.toLowerCase() == message) enable(config.Gruppe[num].ServergroupId,config.Gruppe[num].Name);
            // if (config.Gruppe[num].CommandOn.toLowerCase() == message) enablenew(config.Gruppe[num].ServergroupId);
            
        };
        
    });

    function disable(ServergroupId,Time,Name,Groupname) {
        engine.log('Disable Servergroup ' + ServergroupId + ' for ' + Time + ' Minutes von: ' + Name);
        //engine.log('Topic Change: ' + Topicchange);
        var channel = backend.getCurrentChannel();
        var clients = channel.getClients();
        var invoker = backend.getClientByName(Name);

        // Neu gemäß Permission
        // var servergroup = backend.getServerGroupByID(ServergroupId);
        // servergroup.addPermission(221).delete();
        // servergroup.addPermission(221).save();
        // mytimeout = setTimeout(function() {enablenew(ServergroupId)}, Time*60000);

        var group = backend.getServerGroupByID(ServergroupId);
        
        clients.forEach(client => {
            let clientgroup = client.getServerGroups();
            clientgroup.forEach(gruppe => {
                if (parseInt(gruppe.id()) === ServergroupId) {
                    engine.log('Client: ' + client.name() + ' found at Servergroup: ' + gruppe.id() + ' - turn off!');
                        store.set(client.uid(), client.description());
                        client.setDescription('Abgeschaltet von '+ Name + ' für ' + spellcheck(Time));
                        
                        engine.log('Client Topic changed.');
                        client.addToServerGroup(112);
                        counter++;

                    // Servergruppe die Talkpower entziehen
                    //group.addPermission(221).setValue('0');
                    //group.addPermission(221).save();
                };          
            });
        });
        engine.log('Es wurden: ' + counter + 'x ' + Groupname + ' für ' + spellcheck(Time) + ' runter gesetzt');
        if (counter > 0) {
            mytimeout = setTimeout(function() {enable(ServergroupId)}, Time*60000);
            invoker.poke(counter + 'x ' + Groupname + ' für ' + spellcheck(Time) + ' runter gesetzt!');
            counter = 0;
        };
    };

    function spellcheck(Time) {
        if (Time <=1) return '1 Minute'; else return Time + ' Minuten';
    }

    function enablenew(ServergroupId) {
        var talkpower = new Number(10);
        var servergroup = backend.getServerGroupByID(ServergroupId);
        servergroup.addPermission('i_client_talk_power').setValue(talkpower);
        //servergroup.addPermission('i_client_talk_power').setNegated(true);
        servergroup.addPermission('i_client_talk_power').save();
        clearTimeout(mytimeout);
    }
    
    function enable(ServergroupId,Topicchange) {
        engine.log('Servergroup comes back...');
        store.getKeys().forEach(clientuid => {
            description = store.get(clientuid);
            let client = backend.getClientByUID(clientuid);
            if (client)  {
                client.setDescription(description);
                if (client.removeFromServerGroup(112)) engine.log(client.name() + ' wird zurückgeschoben'); else engine.log('FEHLER: ' + client.name() + ' kann nicht zurück geholt werden!!');
            };
            store.unset(clientuid);             
        });
        //var servergroup = backend.getServerGroupByID(ServergroupId);
        
    };
        //group.addPermission(221).setValue('10');
        //group.addPermission(221).save();

    startup();
});
