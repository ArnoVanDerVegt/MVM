wheel(
    'simulator.includes.sound',
    [
        '#define MODULE_SOUND      7',
        '',
        '#define SOUND_PLAY_TONE   0',
        '#define SOUND_PLAY_SAMPLE 1',
        '',
        'proc playTone(number frequency, number duration, number volume)',
        '    struct PlayTone',
        '        number frequency',
        '        number duration',
        '        number volume',
        '    ends',
        '    PlayTone playTone',
        '    set      playTone.frequency, frequency',
        '    set      playTone.duration,  duration',
        '    set      playTone.volume,    volume',
        '    addr     playTone',
        '    module   MODULE_SOUND,       SOUND_PLAY_TONE',
        'endp'
    ]
);
