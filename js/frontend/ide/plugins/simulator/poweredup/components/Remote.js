/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const DOMNode  = require('../../../../../lib/dom').DOMNode;
const BasicHub = require('./BasicHub').BasicHub;

const RemoteButtons = class extends DOMNode {
        constructor(opts) {
            super(opts);
            this._remote    = opts.remote;
            this._className = opts.className;
            this._prefix    = opts.prefix;
            this.initDOM(opts.parentNode);
        }

        initDOM(parentNode) {
            this.create(
                parentNode,
                {
                    className: 'abs control-circle ' + this._className,
                    children: [
                        {
                            className: 'abs buttons',
                            children: [
                                {
                                    className: 'abs buttons',
                                    children: [
                                        {
                                            ref:       this._remote.setRef(this._prefix + 'Min'),
                                            className: 'flt max-h button-left',
                                            innerHTML: '-'
                                        },
                                        {
                                            ref:       this._remote.setRef(this._prefix + 'Center'),
                                            className: 'flt max-h button-center'
                                        },
                                        {
                                            ref:       this._remote.setRef(this._prefix + 'Plus'),
                                            className: 'flt max-h button-right',
                                            innerHTML: '+'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );
        }
    };

exports.Remote = class extends BasicHub {
    constructor(opts) {
        super(opts);
        this._buttons = 0;
        opts.plugin.setRemote(this);
        this
            .initDOM(opts.parentNode)
            .initButtons();
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                ref:       this.setRef('remote'),
                className: 'hub-remote',
                children: [
                    {
                        type:      RemoteButtons,
                        remote:    this,
                        prefix:    'buttonLeft',
                        className: 'left'
                    },
                    {
                        className: 'abs remote-button'
                    },
                    {
                        className: 'abs hub-light',
                        ref:       this.setRef('hubLight')
                    },
                    {
                        type:      RemoteButtons,
                        remote:    this,
                        prefix:    'buttonRight',
                        className: 'right'
                    }
                ]
            }
        );
        return this;
    }

    initButton(element, className, buttons) {
        let onMouseDown = (event) => {
                this._buttons    = buttons;
                element.className = className + ' pressed';
                event.stopPropagation();
                event.preventDefault();
            };
        let onMouseUp   = (event) => {
                this._buttons     = 0;
                element.className = className;
                event.stopPropagation();
                event.preventDefault();
            };
        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mouseout',  onMouseUp);
        element.addEventListener('mouseup',   onMouseUp);
    }

    initButtons() {
        let refs = this._refs;
        this.initButton(refs.buttonRightMin,    'flt max-h button-left',    8);
        this.initButton(refs.buttonRightCenter, 'flt max-h button-center', 16);
        this.initButton(refs.buttonRightPlus,   'flt max-h button-right',  32);
        this.initButton(refs.buttonLeftMin,     'flt max-h button-left',    1);
        this.initButton(refs.buttonLeftCenter,  'flt max-h button-center',  2);
        this.initButton(refs.buttonLeftPlus,    'flt max-h button-right',   4);
    }

    getButtons() {
        return this._buttons;
    }

    setButton(buttons) {
        this._buttons = buttons;
        let refs = this._refs;
        refs.buttonRightMin.className    = 'flt max-h button-left'   + (((buttons &  8) ===  8) ? ' pressed' : '');
        refs.buttonRightCenter.className = 'flt max-h button-center' + (((buttons & 16) === 16) ? ' pressed' : '');
        refs.buttonRightPlus.className   = 'flt max-h button-right'  + (((buttons & 32) === 32) ? ' pressed' : '');
        refs.buttonLeftMin.className     = 'flt max-h button-left'   + (((buttons &  1) ===  1) ? ' pressed' : '');
        refs.buttonLeftCenter.className  = 'flt max-h button-center' + (((buttons &  2) ===  2) ? ' pressed' : '');
        refs.buttonLeftPlus.className    = 'flt max-h button-right'  + (((buttons &  4) ===  4) ? ' pressed' : '');
    }

    hide() {
        this._refs.remote.className = 'hub-remote';
    }

    show() {
        this._refs.remote.className = 'hub-remote visible';
    }
};
