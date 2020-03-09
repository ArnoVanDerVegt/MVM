/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const DOMNode = require('../../../../../lib/dom').DOMNode;

let colors = [];
colors[  0] = 'black';
colors[  1] = 'pink';
colors[  2] = 'purple';
colors[  3] = 'blue';
colors[  4] = 'light-blue';
colors[  5] = 'cyan';
colors[  6] = 'green';
colors[  7] = 'yellow';
colors[  8] = 'orange';
colors[  9] = 'red';
colors[ 10] = 'white';
colors[255] = 'none';

exports.BasicHub = class extends DOMNode {
    constructor(opts) {
        super(opts);
        this._light = null;
    }

    getVectorRow(ref, title, addZ) {
        return [
            {
                className: 'hub-state-row',
                children: [
                    {
                        type:      'span',
                        innerHTML: title
                    }
                ]
            },
            {
                className: 'hub-state-row',
                children: [
                    {
                        ref:       this.setRef(ref + 'X'),
                        className: 'xyz',
                        innerHTML: 'x'
                    },
                    {
                        ref:       this.setRef(ref + 'Y'),
                        className: 'xyz',
                        innerHTML: 'y'
                    },
                    addZ ?
                        {
                            ref:       this.setRef(ref + 'Z'),
                            className: 'xyz',
                            innerHTML: 'z'
                        } :
                        null
                ]
            }
        ];
    }

    getLight() {
        if (this._light) {
            return this._light;
        }
        let hubLight = this._refs.hubLight;
        this._light = {
            setColor: function(color) {
                if (colors[color] !== undefined) {
                    hubLight.className = 'hub-light ' + colors[color];
                }
            },
            off: function() {
                hubLight.className = 'hub-light none';
            }
        };
        return this._light;
    }

    getButtons() {
        return this._buttons;
    }

    setButton(button) {
    }

    setTilt(tilt) {
        let refs = this._refs;
        refs.tiltX.innerHTML = 'x: ' + tilt.x;
        refs.tiltY.innerHTML = 'y: ' + tilt.y;
        if (refs.tiltZ) {
            refs.tiltZ.innerHTML = 'z: ' + tilt.z;
        }
    }

    clear() {
        let refs = this._refs;
        refs.tiltX.innerHTML = 'x';
        refs.tiltY.innerHTML = 'y';
        if (refs.tiltZ) {
            refs.tiltZ.innerHTML  = 'z';
        }
        if (refs.accelX) {
            refs.accelX.innerHTML = 'x';
            refs.accelY.innerHTML = 'y';
            refs.accelZ.innerHTML = 'z';
        }
    }
};
