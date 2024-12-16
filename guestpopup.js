registerPlugin({
    name: 'GUEST PopUP',
    version: '1.0',
    description: 'Welcome PopUP for Guests',
    author: 'Michael 13MHW75 <michael@hertel-wolfhagen.de>',
    backends: ['ts3', 'discord'],
    vars: [
        {
			name: 'popup',
			title: 'PopUP-Nachricht für Gäste, welche zwischen 23:00 - 06:00 Uhr rein kommen',
			type: 'checkbox'
        },
    ]
}, function(sinusbot, config) {
    var event = require('event');
    var engine = require('engine');
    
    if (!config || typeof config.popup == 'undefined') {
        config.popup = false;
        engine.saveConfig(config);
    }
    

    event.on('clientMove', function(ev) {
        setTimeout(function() {
            if (typeof ev.fromChannel == 'undefined' && isinGroup(ev.client,8)) {
                if (new Date().getHours < 23 && new Date().getHours > 8) ev.client.poke('Freischaltungen i.d.R nur von 08:00 - 23:00Uhr. Versuche es später wieder...');
			    else if (config.popup) ev.client.poke('Du benötigst eine Freischaltung und eine PTT-Taste, um im Gatewayraum teilnehmen zu können.');
            }
        }, 1500);
    });

    function isinGroup(client, id) {
        return client.getServerGroups().some(group => {
        return group.id() == id;
        });
    }
});
