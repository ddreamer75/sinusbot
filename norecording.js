registerPlugin({
    name: 'No Recording!',
    version: '3.0.1',
    backends: ['ts3'],
    description: 'This script will kick anyone who attempts to record.',
    author: 'SinusBot Team / Modded by Michael <michael@hertel-wolfhagen.de>', // Michael Friese, Max Schmitt, Jonas Bögle
    vars: [{
        name: 'kickMessage',
        title: 'The optional kick message.',
        type: 'string',
        placeholder: 'No recording on our server!'
    },
    {
        name: 'groupidallowed',
        title: 'Servergruppen-ID, welche Sprachaufnahmen machen darf:',
        type: 'string'
    }]
}, (_, config,meta) => {

    const event = require('event');
    const engine = require('engine');
    const backend = require('backend');
    const message = meta.name + ' V' + meta.version +' > ';
    const kickMessage = config.kickMessage || 'No recording on our server!'

    event.on('load',() => {
       if (backend.isConnected()) engine.log(message + 'loaded successfully.');
    });

    event.on('clientRecord', client => {
        let text = message + client.name() + ' starts recording...';
        if (typeof config.groupidallowed != 'undefned' && config.groupidallowed != '') {
            if (isinGroup(client, parseInt(config.groupidallowed))) {
                engine.log(text);
                return;
            } else {
                client.kick(kickMessage);
                engine.log(text + 'not allowed - kicked!');
            }
        } else {
            client.kick(kickMessage);
            engine.log(text + 'not allowed - kicked!');
        }
    });

    function isinGroup(client, id) {
        return client.getServerGroups().some(group => {
        return group.id() == id;
        });
    }

})