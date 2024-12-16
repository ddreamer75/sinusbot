registerPlugin({
    name: 'AloneMode',
    version: '3.2.0',
    backends: ['ts3', 'discord'],
    description: 'This script will save CPU and bandwidth by stopping or muting the bot when nobody is listening anyways.',
    author: 'SinusBot Team', // Michael Friese, Max Schmitt, Jonas Bögle, Fabian "fabm3n"
    vars: [
        {
        name: 'mode',
        title: 'Modus',
        type: 'select',
        options: [
            'Stummschalten',
            'Track stoppen aber letzte Pos. merken',
            'Track endgültig stoppen'
        ]
    },
    {
        name: 'repeat',
        title: 'Dauerschleife aktivieren',
        type: 'checkbox'
    }
]
}, (sinusbot, config) => {
        const engine = require('engine')
        const backend = require('backend')
        const event = require('event')
        const audio = require('audio')
        const media = require('media')

        const MUTE_ONLY = '0'
        const STOP_PLAYBACK_SEEK = '1'
        const STOP_PLAYBACK_NOSEEK = '2'

        let isMuted = false
        let lastPosition = 0
        let lastTrack

        audio.setMute(false)
        if (audio.isPlaying() && config.repeat)
            audio.setRepeat(true)

        event.on('clientMove', () => {
            let currentChannel = backend.getCurrentChannel()
            let clients = currentChannel ? currentChannel.getClientCount() : 0

            if (clients > 1 && isMuted) {
                isMuted = false
                engine.log('Ending AloneMode...')

                if (config.mode == MUTE_ONLY) {
                    audio.setMute(false)
                } else {
                    if (lastTrack) {
                        lastTrack.play()
                        if (config.mode == STOP_PLAYBACK_SEEK) {
                            audio.seek(lastPosition)
                            engine.log(`Seeking to ${lastPosition} of track '${lastTrack.title()}'`)
                        }
                    }
                    audio.setMute(false)
                }
            } else if (clients <= 1 && audio.isPlaying() && isMuted == false) {
                isMuted = true
                engine.log('Starting AloneMode...')

                if (config.mode == MUTE_ONLY) {
                    audio.setMute(true)
                } else {
                    lastPosition = audio.getTrackPosition()
                    lastTrack = media.getCurrentTrack()
                    engine.log(`Position ${lastPosition} saved for track '${lastTrack.title()}'`)
                    audio.setMute(true)
                    media.stop()
                }
            }
        })
    })
