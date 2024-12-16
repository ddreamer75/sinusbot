/**
 * Telegram Bot für www.agteway-deutscvhland.de *
 * Programmed by: Michael Hertel
 * Code-sniplets: THX to Jonas Bögle
 */

registerPlugin({
    name: 'Telegram Bot V1',
    version: '1.0.7 beta',
    description: 'Telegram BOT für Gateway Status`.',
    author: 'Michael H. (13MHW75)',
    engine: '>= 1.0.0',
    backends: ['ts3'],
    requiredModules: ['http'],
    vars: [
        {   name: 'Place1',
            title: '->>> Globale Einstellungen <<<-',
        },
        {
            name: 'token',
            title: 'Telegram Bot Token from @BotFather (https://t.me/BotFather)',
            type: 'password',
            placeholder: '',
        },
        {   name: 'debug', 
            title: 'Enable DEBUG',
            type: 'checkbox',
        },
        {   name: 'spacer2',
            title: ''
        },
        {   name: 'notification',
            title: 'Benachrichtigungs Einstellungen für Gatewayüberwachung',
            type: 'array',
            vars: [
                {
                    name: 'username',
                    title: 'Nutzername',
                    type: 'string',
                    indent: 2
                },
                {   name: 'chat_id',
                    title: 'Chat-ID des Benutzers',
                    type: 'string',
                    indent: 2
                },
                {   name: 'uid',
                    title: 'Gateway / Dienst / BOT usw. UID, welche überwacht werden sollen (oder "all" für alle, "CB" für alle CB, "FRE" für alle Freenet, usw.)',
                    type: 'string',
                    indent: 2
                },
                {   name: 'system_name',
                    title: 'Name des zu überwachenden Dienstes / Gateways',
                    type: 'string',
                    indent: 4,
                },
                {   name: 'time',
                    title: 'Überwachungszeitraum (keine Angabe beudetet 24h Überwachung!)   --- zur Zeit Inaktiv',
                    type: 'string',
                    indent: 2,
                    placeholder: '08:00-22:00'
                },
                {   name: 'enabled',
                    title: 'Überwachung aktivieren.',
                    type: 'checkbox',
                    indent: 10
                },
                {   name: 'enabled_onoff',
                    title: 'Überwachung -nur Online/Offline Status- aktivieren.',
                    type: 'checkbox',
                    indent: 10,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    }]
                },
                {   name: 'spacer3',
                    title: ''
                }
            ]
        },
        {   name: 'notification_admin',
            title: 'Benachrichtigungs Einstellungen ADMINs',
            type: 'array',
            vars: [
                {
                    name: 'username',
                    title: 'Nutzername',
                    type: 'string',
                    indent: 2
                },
                {   name: 'chat_id',
                    title: 'Chat-ID des Benutzers',
                    type: 'string',
                    indent: 2
                },
                {   name: 'enabled',
                    title: 'Überwachung aktivieren.',
                    type: 'checkbox',
                    indent: 10
                },
                {   name: 'newuser',
                    title: 'Benachrichtigen, wenn ein neuer Gast die Plattform betritt',
                    type: 'checkbox',
                    indent: 10,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    }]
                },
                {   name: 'newuser_ip',
                    title: 'Zeige auch die IP des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,
                    }]
                },
                {   name: 'newuser_ping',
                    title: 'Zeige auch den aktuellen PING des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,
                    }]
                },
                {   name: 'newuser_uid',
                    title: 'Zeige auch die UID des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,
                    }]
                },
                {   name: 'newuser_os',
                    title: 'Zeige auch das Betriebssystem des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,
                    }]
                },
                {   name: 'newuser_version',
                    title: 'Zeige die TS3-Client Version des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,
                    }]
                },
                {   name: 'newuser_country',
                    title: 'Zeige auch das Land des neuen Users',
                    type: 'checkbox',
                    indent: 14,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    },{
                        field: 'newuser',
                        value: true,

                    }]
                },
                {   name: 'spacer4',
                    title: '',
                    conditions: [{
                        field: 'enabled',
                        value: true,
                },{
                        field: 'newuser',
                        value: true,

                    }]
                },
                {   name: 'banuser',
                    title: 'Benachrichtigen, wenn ein User / Gateway gebannt wurde',
                    type: 'checkbox',
                    indent: 10,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    }]
                },
                {   name: 'kickuser',
                    title: 'Benachrichtigen, wenn ein User / Gateway gekickt wurde',
                    type: 'checkbox',
                    indent: 10,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    }]
                },
                {   name: 'rights',
                    title: 'Benachrichtigen, wenn Rechte vergeben / entzogen wurden',
                    type: 'checkbox',
                    indent: 10,
                    conditions: [{
                        field: 'enabled',
                        value: true,
                    }]
                },

            ]
        },
        {
            name: 'message',
            title: 'Message (placeholders: channellist, clientcount, userid, chatid, username, first_name, last_name)',
            type: 'multiline',
            placeholder: `Example:\n{clientcount} clients online:\n{channellist}`,
            default: `{clientcount} clients online:\n{channellist}`,
        },
        {
            name: 'help',
            title: '/help Message',
            type: 'multiline',
            default: `Commands:
/help - Shows this message
/status - Shows clients
/playing - Shows currently playing song
/about - About this bot`,
            // conditions: [{ field: 'master', value: true }],
        },
    ]
}, (_, config, meta) => {
    const engine = require('engine')
    const event = require('event')
    const backend = require('backend')
    const http = require('http')
    const store = require('store')
    const audio = require('audio')
    const media = require('media')

    var header = false;
    var invoker ='';
    var invokerid = '';
    var channels = [7,112];
    var modus ='';

    // Zeitdifferenz, wenn backend Offline war
    const uptime = new Date();

    // const MASTER = config.master;
    const TOKEN = config.token;

    engine.log(`Loaded ${meta.name} v${meta.version} by ${meta.author}.`);

    // check if bot token is set
    if (!TOKEN) {
        engine.log('Please set the Telegram Bot Token in the script config.');
        engine.notify('Please set the Telegram Bot Token in the script config.');
        return;
    }

    // check other settings
    config.notification.forEach((notification, index) => {
        if (notification.chat_id === undefined || notification.chat_id == '' || isNaN(notification.chat_id)) {
            engine.log('ERROR! Missing Chat_ID in ' + index + ' set. STOP!');
            return;
        }
        if (notification.uid === undefined || notification.uid === '') {
            notification.uid = 'all';
        } else if (notification.uid.toLowerCase() === 'cb' || notification.uid.toLowerCase() === 'fre' || notification.uid.toLowerCase() === 'lpd' || notification.uid.toLowerCase() === 'pmr' || notification.uid.toLowerCase() === 'all') {
            notification.uid = notification.uid.toLowerCase();
        } else if (notification.uid.length < 10) {
            engine.log('ERROR! Wrong Entry in ' + index + ' set. STOP!');
            return;
        }
        if (notification.username == undefined || notification.username == '') {
            engine.log('ERROR! Wrong Entry in ' + index + ' set. STOP!');
            return;
        }
        if ((notification.system_name == undefined || notification.system_name == '') && notification.uid.length > 3) {
            engine.log('ERROR! Wrong Entry in ' + index + ' set. STOP!');
            return;
        }
    });
    
    const CLIENT_PREFIX = "  ";
    // Maximum retries after which to top querying.
    const MAX_RETRIES = 5;
    // Interval in which to check for new messages.
    const INTERVAL = 30; // seconds
    // Request Timeout
    const TIMEOUT = INTERVAL;
    // Status Channels
    const channelarray = ['36', '42', '37', '308', '1823'];
    // BOTS UIDs
    const botuids = ['fupls1DPVqr7tr6BG/0P6wReRfM=','yuaAUcNxTf2UMKULivNuN/H/seo=','0TKeDIko2N6rk0WdB4G1HwPADPA=','uU2uN3oL2mtzR4Zy/n9CZbQRzuE='];

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

    // error counter
    let errors = 0;
    // update offset
    let offset = store.getInstance('offset') || null;
    let intervalID;

    waitForBackend(10, 5)
    .then(() => {
        startPolling();
    });

    
    event.on('disconnect', ev => {
        var lastsend = '';
        config.notification.forEach(notification => {
            if (notification.chat_id !== lastsend) {
                lastsend = notification.chat_id;
                sendMessage(notification.chat_id, '<b><i>TELEGRAM BOT currently offline!</i></b>', 'HTML')
                .catch(err => {
                    engine.log(err);
                });
            };
        });
    });
    
    
    event.on('serverGroupAdded', function(ev) {
        if (!botuids.includes(ev.invoker.uid())) {
            invokerid = ev.invoker.uid();
            invoker = ev.invoker.name();
        };

        modus = '<i>' + ev.serverGroup.name() + '</i>';

        if (ev.serverGroup.id() == 112 || ev.serverGroup.id() == 19) {
            return;
        } else {
           
            // if (message == '' || typeof message == 'undefined') 
            var message = '<b><u>Neue Rechte vergeben:</u></b>\n<code>' + ev.client.name() + '</code>';
            message += '\n +' + ev.serverGroup.name();
            setTimeout(function (message) {
                message += '\n\n<b>Von: </b><i>' + invoker +'</i>';
                config.notification_admin.forEach((notification, index) => {
                    if (notification.enabled && notification.rights) {
                        sendMessage(notification.chat_id, message, 'HTML')
                        .catch(err => {
                            engine.log(err);
                        });
                    };
                });
            }, 1000);
        };
        message = '';
    });


    event.on('serverGroupRemoved', function(ev) {
        if (!botuids.includes(ev.invoker.uid())) {
            invokerid = ev.invoker.uid();
            invoker = ev.invoker.name();
        };

        modus = '<s><i>' + ev.serverGroup.name() + '</i></s>';

        if ((ev.serverGroup.id() == 112 || ev.serverGroup.id() == 19)) {
            return;
        } else {
   
            if (message == '' || typeof message == 'undefined') var message = '<b><u>Rechte entzogen:</u></b>\n<code>' + ev.client.name() + '</code>';
            message += '\n <s>' + ev.serverGroup.name() + '</s>';
            setTimeout(function (message) {
                message += '\n\n<b>Von: </b><i>' + invoker + '</i>';
                config.notification_admin.forEach((notification, index) => {
                    if (notification.enabled && notification.rights) {
                        sendMessage(notification.chat_id, message, 'HTML')
                        .catch(err => {
                            engine.log(err);
                        });
                    };
                });
            }, 1000);
        };
        message = '';
    });

    event.on('clientKicked', function(ev) {
        var invoker = ev.invoker.name();
        var message = '<b><u>Client gekickt!</u></b>\n<code>' + ev.client.name() + '</code>\n\n<b>Aus Channel: </b><i>' + ev.fromChannel.name() + '</i>\n<b>Von: </b><i>' + invoker +'</i>\n<b>Grund: </b><i>' + ev.message + '</i>\n<b>Online: </b><i>' + msToTime(ev.client. getOnlineTime()) + '</i>';
        config.notification_admin.forEach((notification, index) => {
            if (notification.enabled && notification.kickuser) {
                engine.log('Kick: ' + message + '(ID: ' + notification.chat_id + ')');
                sendMessage(notification.chat_id, message, 'HTML');
                //.catch(err => {
                //    engine.log(err);
                //});
                message = '';
            };
        });
    });
    
    event.on('clientBanned', function(ev) {
        var invoker = ev.invoker.name();
        var message = '<b><u>Client gebannt!</u></b>\n<code>' + ev.client.name() + '</code>\n\n<b>Aus Channel: </b><i>' + ev.fromChannel.name() + '</i>\n<b>Von: </b><i>' + invoker +'</i>\n<b>Grund: </b><i>' + ev.message + '</i>\n<b>Online: </b><i>' + msToTime(ev.client. getOnlineTime()) + '</i>';
        config.notification_admin.forEach((notification, index) => {
            if (notification.enabled && notification.banuser) {
                sendMessage(notification.chat_id, message, 'HTML')
                .catch(err => {
                    engine.log(err);
                });
                message = '';
            };
        });
    });
    

    // Addon für Gateway Benachrichtigung (Online/Offline)
    event.on('clientMove', function(ev) {
        var zeit = new Date();

        if ((zeit.getTime()-uptime.getTime()) < 5000) return;  // Notwending, das wenn der BOT neu gestartet wird es nicht Nachrichten flutet !

        // Info, wenn ein System von wem Verschoben wurde 
        if (typeof ev.fromChannel !== 'undefined' && typeof ev.toChannel !== 'undefined' && hasServerGroupWithID(ev.client, 164)) {
            if (invoker == '' && botuids.includes(ev.invoker.uid())) invoker = '<b>-=BOT=-</b>'; else if (invoker == '') invoker = ev.invoker.name();
            config.notification.forEach((notification, index) => {
                if (notification.enabled) {
                    if (notification.uid == ev.client.uid() || notification.uid == 'all' || (notification.uid == 'pmr' && hasServerGroupWithID(ev.client,108)) || (notification.uid == 'cb' && hasServerGroupWithID(ev.client,107)) || (notification.uid == 'fre' && hasServerGroupWithID(ev.client,109)) && notification.uid !== ev.invoker.uid() && invokerid !== notification.uid ) {
                        if (!notification.enabled_onoff) {
                            var message = '<b>' + systen(ev.client) + ' verschoben! </b>\n<i>' + ev.client.name() + '</i>\n\n<u>Information:</u>\nnach: ' + ev.toChannel.name() + '\nvon: ' + invoker;
                            if (modus == '' || typeof modus == 'undefined') message +='\nModus: <i>von Hand</i>'; else message +='\nModus: ' + modus;
                            sendMessage(notification.chat_id, message, 'HTML')
                            .catch(err => {
                                engine.log(err);
                            });
                        };
                    }; 
                }
            });
            invoker = '';
            modus = '';
        } 
     
        // if (typeof ev.toChannel == 'undefined' && hasServerGroupWithID(ev.client, 164) && (config.gwnotification || config.servicenotification || config.digimodenotification)) {
        if (typeof ev.toChannel == 'undefined' && hasServerGroupWithID(ev.client, 164)) {
            if (config.debug) {
                engine.log('Event Offline Handling start by: ' + ev.client.name());
            }
            // abklappern von Usern und deren Benachrichtigungn
            config.notification.forEach((notification, index) => {
                if (notification.enabled) {
                    if (config.debug) {
                        engine.log('Notification enabled ny client: ' + notification.uid);
                    }
                    if (notification.uid == ev.client.uid() || notification.uid == 'all' || (notification.uid == 'pmr' && hasServerGroupWithID(ev.client,108)) || (notification.uid == 'cb' && hasServerGroupWithID(ev.client,107)) || (notification.uid == 'fre' && hasServerGroupWithID(ev.client,109))) { 
                        var message = '<b>' + systen(ev.client) + ' Offline: </b>\n<i>' + ev.client.name() + '</i>\n\n<u>Information:</u>\nLast Ping: ' + ev.client.getPing() + 'ms\nPacket Loss: ' + ev.client.getPacketLoss() + '%\nOnline: ' + msToTime(ev.client. getOnlineTime());
                        if (config.debug) engine.log('Bedingung erfüllt. Telegram Nachricht an: ' + notification.chat_id + 'Text: ' + message);
                        sendMessage(notification.chat_id, message, 'HTML')
                        .catch(err => {
                            engine.log(err);
                        });
                    }
                };
            });            
        };

        // Handle Reconnect ...
        if (typeof ev.fromChannel == 'undefined' && hasServerGroupWithID(ev.client, 164) ) {
            if (config.debug) {
                engine.log('Event Online Handling start by: ' + ev.client.name());
            }
            // abklappern von Usern und deren Benachrichtigungn
            config.notification.forEach((notification, index) => {
                if (notification.enabled) {
                    if (config.debug) {
                        engine.log('Notification enabled ny client: ' + notification.uid);
                    }

                    if (notification.uid == ev.client.uid() || notification.uid == 'all' || 
                    (notification.uid == 'pmr' && hasServerGroupWithID(ev.client,108)) || 
                    (notification.uid == 'cb' && hasServerGroupWithID(ev.client,107)) || 
                    (notification.uid == 'fre' && hasServerGroupWithID(ev.client,109))) { 
                        var message = '<b>' + systen(ev.client) + ' wieder Online: </b>\n<i>' + ev.client.name() + '</i>\n\n<u>Information:</u>\nRaum: ' + getChannelName(ev.client) + '\nZeit: ' + Zeit(zeit);
                        if (config.debug) engine.log('Bedingung erfüllt. Telegram Nachricht an: ' + notification.chat_id + 'Text: ' + message);
                        sendMessage(notification.chat_id, message, 'HTML')
                        .catch(err => {
                            engine.log(err);
                        });            
                    }
                };
            });            
        };

        if (typeof ev.fromChannel == 'undefined' && hasServerGroupWithID(ev.client, 8) ) {
            var header = '<b><u>Neuer Gast Online!</u></b>\n<code>' + ev.client.name() + '</code>\n'
            var message = '';
            config.notification_admin.forEach((notification, index) => {
                if (notification.enabled && notification.newuser) {
                    setTimeout(function () {
                       
                        if (notification.newuser_uid) message += '\n<b>UID:</b><i> ' + ev.client.uid() + '</i>';
                        if (notification.newuser_ip) {
                            if (ev.client.getIPAddress().length > 16) message += '\n<b>IPv6:</b>'; else message += '\n<b>IP:</b>';
                            message += '<i> ' + ev.client.getIPAddress() + '</i>';
                            }
                        if (notification.newuser_ping) message += '\n<b>Ping:</b><i> ' + ev.client.getPing() + 'ms</i>';
                        if (notification.newuser_country) message += '\n<b>Land:</b><i> ' + ev.client.country() + '</i>';
                        if (notification.newuser_os) message += '\n<b>OS:</b><i> ' + ev.client.getPlatform() + '</i>';
                        if (notification.newuser_version) message += '\n<b>TS-Version:</b><i> ' + ev.client.getVersion() + '</i>';
                        sendMessage(notification.chat_id, header+message, 'HTML')
                        .catch(err => {
                            engine.log(err);
                        });
                        message = '';
                    }, 3000);
                }
            });
        };           
    });

    function startPolling() {
        // clear previous interval
        if (intervalID) stopPolling();

        // start interval
        intervalID = setInterval(queryTelegram, INTERVAL * 1000 + 100 /* milliseconds */);

        // poll now
        queryTelegram();
    }

    function stopPolling() {
        clearInterval(intervalID);
    }

    function queryTelegram() {
        telegram('getUpdates', {
            timeout: TIMEOUT+2, // long polling
            allowed_updates: ['message'], // only update on messages
            offset: offset, // start after last update
        }).then(updates => {
            // set offset, so we don't read the same messages multiple times
            offset = updates[updates.length-1].update_id + 1;

            updates.forEach(update => {
                const msg = update.message;
                // ignore non-message updates
                if (!msg) return engine.log(`ignoring non-message update: ${update}`);

                handleMessage(msg);
            });

            // reset error counter
            errors = 0;

            // update offset in storage
            store.setInstance('offset', offset);

            // restart polling
            startPolling();
        })
        .catch(err => {
            // ignore timeouts since we are using long polling
            if (typeof err === 'string' && err.includes('Timeout exceeded while awaiting headers')) return;

            if (err === 'Unexpected status code: 409') {
                engine.log('Polling Error. This happens when you enable the script more than once.');
                // ...or if anyone messes up the TIMEOUT(s) or webhook is still set
            } else {
                engine.log(err);
            }

            errors++; 
            
            if (errors > MAX_RETRIES) {
                engine.log('Aborting due to too many Telegram API errors. Please restart the script by pressing "Save Changes" in the script settings.');
                stopPolling();
            } 
        });
    }

    function msToTime(duration) {
        var seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return hours + ":" + minutes + ":" + seconds;
    }

    function Zeit(zeit) {
        var hours = zeit.getHours()+1,
            minutes = zeit.getMinutes();

        hours += (zeit.getTimezoneOffset() / 60)
            
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        
        return hours + ":" + minutes + ' Uhr';
    }

    function handleMessage(msg) {
        let text = msg.text || '';

        engine.log(`received '${text}' from ${msg.chat.id} (${msg.chat.type})`);

        text = text.replace(`@${bot.username}`, '');

        switch (msg.text) {
        case '/start':
            handleStart(msg);
            break;
        case '/help':
            handleHelp(msg);
            break;
        case '/playing':
            handlePlaying(msg);
            break;
        case '/online':
        case '/status':
            handleStatus(msg);
            break;
        case '/test':
            handleOnline(msg);
            break;
        case '/info':
            engine.log
            handleInfo(msg);
            break;
        case '/about':
            handleAbout(msg);
            break;
        case '/monitor':
            handleMonitor(msg);
            break;
        /*case '/list':
        case '/list-pmr':
        case '/list-fre':
        case '/list-cb':
        case '/list-lpd':
            handleList(msg, msg.text);
            break; */
        }
        if (text.includes('/search')) {
            // engine.log('GW Search');
            handleSearch(msg);
            }
        }
    
    const placeholders = {
        userid: ctx => ctx.msg.from.id || '',
        chatid: ctx => ctx.msg.chat.id || '',
        username: ctx => ctx.msg.from.username || '',
        first_name: ctx => ctx.msg.from.first_name || '',
        last_name: ctx => ctx.msg.from.last_name || '',
        clientcount: () => backend.getChannels().reduce((sum, c) => sum + c.getClientCount(), 0),
        channellist: () => {
            let list = '';

            backend.getChannels()
            .sort((a, b) => a.position() - b.position())
            .forEach(channel => {
                let clients = channel.getClients();
                // ignore empty channels
                if (!clients || clients.length === 0) return;

                list += `${channel.name()}:`;
                clients.sort().forEach(client => {
                    list += `\n${CLIENT_PREFIX}${client.name()}`
                });
                list += '\n';
            });

            return list;
        },
    }

    function handleOnline(msg) {
        let channel=backend.getChannelByID('36');
        let name = channel.name();
        sendMessage(msg.chat.id, 'Channel-Name: ' + name)
        .catch(err => {
            engine.log(err);
        });
    }

    /*function handleList(msg, sys) {
        var zaehler = 0;
        var list = '';
               
        // system = system.toLowerCase();
        if (sys='/list') list = '<b><u>Auflistung aller Gateways:</u></b>'; else list = '<b><u>Auflistung '+ systen(text.substring(9, 6)) + ':</u></b>';
        engine.log(sys);
        backend.getChannels()
        .sort((a, b) => a.position() - b.position())
        .forEach(channel => {
            if (channel.id() == 7 || channel.id() == 112) {
                let clients=channel.getClients();
                        
                list += '\n<i><u>' + channel.name() + ':</u></i>';
                clients.sort().forEach(client =>{
                    engine.log(msg.chat.id + ' - ' + system);
                    if (sys = '/list' && hasServerGroupWithID(client, 11)) list += `\n${client.name()}`; zaehler++;
                    if (sys = '/list-pmr' && hasServerGroupWithID(client, 180)) list += `\n${client.name()}`; zaehler++;
                    if (sys = '/list-cb' && hasServerGroupWithID(client, 107)) list += `\n${client.name()}`; zaehler++;
                    if (sys = '/list-fre' && hasServerGroupWithID(client, 109)) list += `\n${client.name()}`; zaehler++;
                    if (sys = '/list-lpd' && hasServerGroupWithID(client, 110)) list += `\n${client.name()}`; zaehler++;

                });
            };
        });

        sendMessage(msg.chat.id, list, 'HTML')
        .catch(err => {
            engine.log(err);
        });


        }

        */

    function handleMonitor(msg) {
        let zaehler=0;
        let text = '<b><u>Du Überwachst z.Zt.:</u></b>\n';

        if (config.debug) engine.log('Bei Handlemonitor angekommen');

        config.notification.forEach(notification => {
            if (notification.chat_id == msg.chat.id) {
                if (config.debug) engine.log ('vergleich Chatid & Notificationid: ' + notification.chat_id + ' = ' + msg.chat.id);
                if (!notification.enabled) text += '<i><s>';
                // if (notification.uid == 'all') text += '\n<Alle Systeme';
                if (notification.uid.length > 3 && notification.uid !== 'all') {
                    text += '\n' + notification.system_name; 
                    let client = backend.getClientByUID(notification.uid);
                    if (typeof client == 'undefined') text += ' - <b><i>(Offline!)</i></b>'; else {
                        text += ' - <b><i>(im ' + getChannelName(client) + ')</i></b>';
                    };
                    zaehler++
                } else {
                    engine.log('Die notificationid: ' + notification.uid + ' - Übersetzt: ' + systen(notification.uid.trim()));
                    text +=  '\n' + systen(notification.uid);
                    zaehler++
                }
                if (!notification.enabled) text += '</s> -- <b>(aus)</b></i>'; 
            };
        
        });

        if (zaehler == 0) text += '<i>keine</i>';
        if (config.debug) engine.log('Alles abgearbeitet: ' + text + 'MessageID: ' + msg.chat.id);
        sendMessage(msg.chat.id, text, 'HTML')
        .catch(err => {
            engine.log(err);
        });
        text = '';
    }
    

    function handleInfo(msg) {
        let list = '<b><u>Onlinestatus:</u></b>\n';

            event.log ('Backend get Channels');
            backend.getChannels()
            .forEach(channel => {
                if (channelarray.includes(channel.id())) {
                    list += '\n' + channel.name();
                    list = list.replace('[cspacer0] ','  ');
                    list = list.replace('[cspacer0]','  ');
                    list = list.replace('[cspacer] ','  ');
                }
            });

            let channel = backend.getChannelByID(548);
            channel.getClients()
            .forEach(client => {
                if (client.uid() == 'uU2uN3oL2mtzR4Zy/n9CZbQRzuE=') return; // QRM-BOT
                if (client.uid() == 'RNCpj4u2H5KLIyBT3GDVOlPLJkU=') return; // Audio Bridge
                if (!header) list += '\n\n<b><u>Gateways in QRM:</u></b>'; header=true;
                list += '\n' + client.name();
            });
            header = false;
            sendMessage(msg.chat.id, list, 'HTML')
            .catch(err => {
                engine.log(err);
            });
    }

    function handleSearch(msg) {
        engine.log('function handleGW called...');
        let text = msg.text;
        let searchstr = text.substr(text.indexOf('>')+1).trim();
        let zaehler = 0;
        let list = '';

        engine.log('Suchbegriff: ' + searchstr);

        let headline = '<b>Suchbegriff: <i>"' + searchstr + '"</i> ergab folgende Treffer:</b>\n';

            backend.getChannels()
            .forEach(channel => {
                let clients = channel.getClients();
                /* if (!clients || clients.length === 0) {
                    list += '\nKeine Clients Online';
                    return;
                } */

                clients.sort().forEach(client => {
                    let cname = client.name();
                    if (cname.toLowerCase().includes(searchstr.toLowerCase())) {
                        // let clchannel = client.getChannels();
                        if (!header) {
                            list += '\n<b><u> %1%:</u></b>';
                            header = true;
                        }
                        list += '\n   ' + client.name();
                        zaehler++;
                    }
                    
                })
                list = list.replace('%1%', channel.name() + ' (' + zaehler + ')');
                zaehler = 0;
                header = false;
                
            });
            if (list == "") list = '\n<i>- keine Treffer! -</i>';
            sendMessage(msg.chat.id, headline + list, 'HTML')
            // sendMessage(msg.chat.id, 'Test', 'HTML')
            .catch(err => {
                engine.log(err);
            });
    }

    function handleHelp(msg) {
        sendMessage(msg.chat.id, config.help)
        .catch(err => {
            engine.log(err);
        });
    }

    function handlePlaying(msg) {
        let response = 'There is nothing playing at the moment.';
        if (audio.isPlaying()) {
            response = formatTrack(media.getCurrentTrack());
        }

        sendMessage(msg.chat.id, response)
        .catch(err => {
            engine.log(err);
        });
    }

    function handleStatus(msg) {
        sendMessage(msg.chat.id, format(config.message, {msg: msg}, placeholders))
        .catch(err => {
            engine.log(err);
        });

    }

    function handleAbout(msg) {
        sendMessage(msg.chat.id, 'Das ist der BOT von <a href="https://www.gateway-deutschland.de">Gateway-Deutschland</a>.\nProgrammiert von ' + meta.author + '\n\n<b>' + meta.version + '</b>', 'HTML')
        .catch(err => {
            engine.log(err);
        });
    }

    function handleStart(msg) {
        sendMessage(msg.chat.id, 'Willkommen bei dem BOT von <a href="https://www.gateway-deutschland.de">Gateway-Deutschland</a>.\nProgrammiert von ' + meta.author + '.\n\nDer BOT ist z.Zt. noch in der Testphase.\nMit /help kannst Du alle Funktionen aufrufen, die der BOT versteht. Alternativ kannst Du auch den Menü-Button (unten Links) verwenden.\nMöchtest Du Benachrichtigungen über dein(e) Dateways bekommen, wende dich an mich an @ffwoh\n\nVersion: <b>' + meta.version + '</b>', 'HTML')
        .catch(err => {
            engine.log(err);
        });
    }

    /**
     * Sends a Telegram text message.
     * @param {(string|number)} chat Chat ID
     * @param {string} text Message Text
     * @param {string} [mode] Parse Mode (Markdown/HTML)
     */
    function sendMessage(chat, text, mode=null) {
        let data = {
            'chat_id': chat,
            'text':  text,
        };

        if (mode) data.parse_mode = mode;

        return telegram('sendMessage', data);
    }

    /**
     * Executes a Telegram API call
     * @param {string} method Telegram API Method
     * @param {object} [data] json data
     * @return {Promise<object>}
     * @author Jonas Bögle
     * @license MIT
     */
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

    /**
     * Formats a string with placeholders.
     * @param {string} str Format String
     * @param {*}      ctx Context
     * @param {object} placeholders Placeholders
     * @author Jonas Bögle
     * @license MIT
     */
    function format(str, ctx, placeholders) {
        return str.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9_\-a-zA-Z]+)(?:\((.+)\))?\})/g, (m, str, placeholder, argsStr) => {
            if (str) {
                return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
            } else {
                if (!placeholders.hasOwnProperty(placeholder) || typeof placeholders[placeholder] !== 'function') {
                    engine.log(`Unknown placeholder: ${placeholder}`);
                    return `{${placeholder}: unknown placeholder}`;
                }
                let args = [];
                if (argsStr && argsStr.length > 0) {
                    args = argsStr.split(/\s*(?<!\\)(?:,|$)\s*/);
                    args.map(arg => arg.replace('\\,', ','));
                }

                let result = `{${placeholder}: empty}`;
                try {
                    result = placeholders[placeholder](ctx, ...args);
                } catch(ex) {
                    result = `{${placeholder}: error}`;
                    engine.log(`placeholder "${placeholder}" caused an error: ${ex}`);
                }

                return result;
            }
        });
    }

    /**
     * Returns a formatted string from a track.
     *
     * @param {Track} track
     * @returns {string} formatted string
     * @author Jonas Bögle
     * @license MIT
     */
    function formatTrack(track) {
        let title = track.tempTitle() || track.title();
        let artist = track.tempArtist() || track.artist();
        return artist ? `${artist} - ${title}` : title;
    }

    function hasServerGroupWithID(client, id) {
        return client.getServerGroups().some(group => {
            return group.id() == id;
        });
    }

    function isinChannel(client,id) {
        client.getChannels().some(channel => {
            return channel.id() == id})
    }

    function getChannelName(client) {
        let channels = client.getChannels();
        channels.forEach(channel => {
            chname = channel.name();   
        });
        return chname;
    }

    function systen(client) {
        if (typeof client == "object" && hasServerGroupWithID(client, 11)) return 'Gateway';
        if (typeof client == "object" && (hasServerGroupWithID(client,9) || hasServerGroupWithID(client, 22))) return 'Service';
        if (typeof client == "object" && (hasServerGroupWithID(client, 99) || hasServerGroupWithID(client, 17))) return 'Digi-Mode';
        if (typeof client == "string" && client == 'fre') return 'alle Freenet Gateways';
        if (typeof client == "string" && client == 'cb') return 'alle CB-Funk Gateways';
        if (typeof client == "string" && client == 'pmr') return 'alle PMR-Gateways';
        if (typeof client == "string" && client == 'lpd') return 'alle LPD-Gateways';
        if (typeof client == "string" && client == 'all') return 'alle Systeme';
    }

    function waitForBackend(attempts, wait) {
        return new Promise((success, fail) => {
            let attempt = 1;
            const timer = setInterval(() => {
                if (backend.isConnected()) {
                    clearInterval(timer);
                    success();
                    return;
                } else if (attempt > attempts) {
                    clearInterval(timer);
                    fail('backend');
                    return;
                }

                attempt++;
            }, wait * 1000);
        });
    }
});
