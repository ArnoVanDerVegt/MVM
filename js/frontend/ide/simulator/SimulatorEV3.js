/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../../lib/dispatcher').dispatcher;
const DOMNode    = require('../../lib/dom').DOMNode;
const Display    = require('./io/Display').Display;
const Buttons    = require('./io/Buttons').Buttons;
const EV3Button  = require('./io/Buttons').Button;
const Button     = require('../../lib/components/Button').Button;

exports.SimulatorEV3 = class extends DOMNode {
    constructor(opts) {
        super(opts);
        opts.id && opts.id(this);
        this._ui     = opts.ui;
        this._onStop = opts.onStop;
        this.initDOM(opts.parentNode);
    }

    initDOM(domNode) {
        this.create(
            domNode,
            {
                className: 'ev3',
                children: [
                    {
                        className: 'ev3-left'
                    },
                    {
                        className: 'ev3-body',
                        children: [
                            {
                                className: 'ev3-display',
                                children: [
                                    {
                                        className: 'display-border',
                                        children: [
                                            {
                                                id:   this.setDisplayElement.bind(this),
                                                type: 'canvas',
                                                ui:   this._ui
                                            },
                                            ('electron' in window) ?
                                                {
                                                    type:     Button,
                                                    ui:       this._ui,
                                                    color:    'blue',
                                                    value:    'Copy',
                                                    onClick:  this.onCopyDisplay.bind(this)
                                                } :
                                                null
                                        ]
                                    }
                                ]
                            },
                            {
                                className: 'ev3-panel',
                                children: [
                                    {
                                        id:   this.setButtons.bind(this),
                                        type: Buttons,
                                        ui:   this._ui
                                    },
                                    {
                                        type:      EV3Button,
                                        ui:        this._ui,
                                        className: 'ev3-button-stop',
                                        up:        'ev3-button-stop',
                                        down:      'ev3-button-stop pressed',
                                        onClick:   this._onStop
                                    }
                                ]
                            },
                            {
                                className: 'ev3-bottom',
                                children: [
                                    {
                                        className: 'ev3-log-text',
                                        innerHTML: 'WHL'
                                    },
                                    {
                                        className: 'ev3-logo'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        className: 'ev3-right'
                    }
                ]
            }
        );
    }

    getButtons() {
        return this._buttons;
    }

    setButtons(buttons) {
        this._buttons = buttons;
    }

    setDisplayElement(element) {
        this._canvas  = element;
        this._display = new Display({canvas: element});
    }

    getDisplay() {
        return this._display;
    }

    onCopyDisplay() {
        const clipboard   = require('electron').clipboard;
        const nativeImage = require('electron').nativeImage;
        clipboard.writeImage(nativeImage.createFromDataURL(this._canvas.toDataURL('image/png')));
        dispatcher.dispatch('Console.Log', {message: 'Copied display to clipboard.'});
    }
};
