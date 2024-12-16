registerPlugin({
    name: 'Demo http basic Script',
    version: '1.0.0',
    description: 'This example script sends a http request.',
    author: 'Author <author@example.com>',
    //...
    // define the protected modules that you require:
    requiredModules: ['http','fs','request'],
    //...
    vars: []
}, (_, config, meta) => {
    const engine = require('engine');
    // and then you can require and use the module in here:
    const http = require('http');
    const fs = require('fs');

    const request = require('request');

    var url = 'http://www.osthessenfunk.de/Audio/Rundspruch_Maerz_2022.mp3';
    
    // send request
    http.simpleRequest({
        'method': 'GET',
        'url': url,
        'timeout': 190000,
    }, function (error, response) {
        if (error) {
            engine.log("Error: " + error);
            return;
        }
        
        if (response.statusCode != 200) {
            engine.log("HTTP Error: " + response.status);
            return;
        }

        // success!
        engine.log("Response: ok, Länge: " + response.data.toString().length);
        fs.writeFile("/opt/sinusbot/sounds/Wasserkuppe.mp3", response.data, 0644);
       
 
    }); 
});