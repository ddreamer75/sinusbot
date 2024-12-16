

registerPlugin({
    name: 'stream2icecast',
    version: '1.0',
    description: '',
    author: 'Michael Friese <michael@sinusbot.com>',
    vars: [{
        name: 'streamServer',
        title: 'StreamServer URL',
        type: 'string',
        placeholder: 'http://sv.meme.com:8000/autodj'
      }, {
        name: 'streamUser',
        title: 'User',
        type: 'string'
      }, {
        name: 'streamPassword',
        title: 'Password',
        type: 'string'
      }]
  }, function (sinusbot, config) {
    var engine = require('engine'), audio = require('audio');
  
    if(!config.streamUser){
      config.streamUser = 'source';
    }
  
    if (config.streamServer && config.streamPassword){
      audio.setAudioReturnChannel(2); 
      audio.streamToServer(config.streamServer, config.streamUser, config.streamPassword);
    }else{
      engine.log("URL or Password missing!");
    }
  });
  
  