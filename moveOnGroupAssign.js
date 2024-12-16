registerPlugin({
    name: 'Move on Group Assign',
    version: '0.1',
    backends: ['ts3'],
    description: 'Moves client based on the specified group that was assigned to him',
    author: 'DrWarpMan',
    vars: [
        {
            name: 'channelAndGroup',
            title: 'List of groups\' IDs + their channel',
            type: 'array',
            vars: [
                {
                    title: 'Servergroup ID',
                    name: 'groupID',
                    type: 'string'
                },
                {
                    title: 'Default Channel',
                    name: 'channelID',
                    type: 'channel'
                },
                {
                    title: 'Verschiebe nur, wenn Client neu auf den Server kommt',
                    name: 'moveon',
                    type: 'checkbox'
                }
            ]
        }
    ]
}, function (_, config, meta) {

    var engine = require('engine');
    var backend = require('backend');
    var event = require('event');
    var text = `${meta.name} > `;
    
    var channelAndGroup;
    if(typeof config.channelAndGroup != 'undefined')
    {   
        channelAndGroup = config.channelAndGroup;
    } else return;

    engine.log(text + 'loaded successfully.');
    
	event.on("clientMove", (ev) => {
            check(ev.client, ev.fromChannel);
        });

    event.on("serverGroupAdded", (ev) => {
            check(ev.client, 'only_add');
        });
    
    function check(client, fromChannel) {

            for(var i = 0; i < channelAndGroup.length; i++) {
                var groupID = channelAndGroup[i].groupID;
                var channelID = channelAndGroup[i].channelID;
                var moveon = channelAndGroup[i].moveon;

                if (hasServerGroupWithId(client, groupID) && !isInChannel(client, channelID)) {
                    if (!hasServerGroupWithId(client, 11) && hasServerGroupWithId(client, 112)) return;
                    if (typeof moveon == 'undefined'  || !moveon) {
                            engine.log(text + 'Bedingung Client: ' + client.name() + ' ist nicht in seiner ServerGruppe. Verschiebe diese Servergruppe immer in zuständigen Raum...');
                            client.moveTo(backend.getChannelByID(channelID));                    
                    } else if (typeof fromChannel == 'undefined' && moveon) {
                        engine.log(text + 'Bedingung Client: ' + client.name() + ' ist nicht in seiner ServerGruppe. Verschiebe diese Servergruppe nur beim einloggen');
                        client.moveTo(backend.getChannelByID(channelID));
                    }
                }
            }
    }

    function hasServerGroupWithId(client, id){
	    return client.getServerGroups().some((group) => group.id() == id)
    }
    
    function isInChannel(client, id) {
	    return client.getChannels().some((channel) => channel.id() == id)
    }
});