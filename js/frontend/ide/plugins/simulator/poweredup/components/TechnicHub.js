/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const BasicHub = require('./BasicHub').BasicHub;

exports.TechnicHub = class extends BasicHub {
    constructor(opts) {
        super(opts);
        this._buttons = 0;
        opts.plugin.setTechnicHub(this);
        this.initDOM(opts.parentNode);
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                children: [
                    {
                        ref:       this.setRef('hubBody'),
                        className: 'technic-hub-body',
                        children: [
                            {
                                className: 'hub-top'
                            },
                            {
                                className: 'hub-middle'
                            },
                            {
                                className: 'hub-bottom'
                            },
                            {
                                className: 'hub-box',
                                children: [
                                    {
                                        className: 'left-connections'
                                    },
                                    {
                                        className: 'right-connections'
                                    },
                                    {
                                        className: 'hub-button'
                                    },
                                    {
                                        className: 'hub-light',
                                        ref:       this.setRef('hubLight')
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        ref:       this.setRef('hubStatus'),
                        className: 'hub-status',
                        children: []
                            .concat(this.getVectorRow('tilt', 'Tilt', true))
                            .concat(this.getVectorRow('accel', 'Acceleration', true))
                    }
                ]
            }
        );
    }

    setAccel(accel) {
        let refs = this._refs;
        refs.accelX.innerHTML = 'x: ' + accel.x;
        refs.accelY.innerHTML = 'y: ' + accel.y;
        refs.accelZ.innerHTML = 'z: ' + accel.z;
    }

    clear() {
        let refs = this._refs;
        refs.tiltX.innerHTML  = 'x';
        refs.tiltY.innerHTML  = 'y';
        refs.tiltZ.innerHTML  = 'z';
        refs.accelX.innerHTML = 'x';
        refs.accelY.innerHTML = 'y';
        refs.accelZ.innerHTML = 'z';
    }

    hide() {
        this._refs.hubBody.className   = 'technic-hub-body';
        this._refs.hubStatus.className = 'hub-status';
    }

    show() {
        this._refs.hubBody.className   = 'technic-hub-body visible';
        this._refs.hubStatus.className = 'hub-status visible';
    }
};
