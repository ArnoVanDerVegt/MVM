/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../dispatcher').dispatcher;
const Component  = require('./Component');

exports.Button = class extends Component.Component {
    constructor(opts) {
        super(opts);
        this._hintDiv       = null;
        this._hint          = opts.hint;
        this._icon          = opts.icon;
        this._baseClassName = (this._icon ? 'icon-' : ' ') + 'button ' + (this._icon ? this._icon : '');
        this.initDOM(opts.parentNode);
    }

    initDOM(parentNode) {
        let style = this._style || {};
        if (this._width && (parseInt(this._width, 10) >= 20)) {
            style.width = this._width + 'px';
        }
        if (this._height && (parseInt(this._height, 10) >= 20)) {
            style.height = this._height + 'px';
        }
        this.create(
            parentNode,
            {
                id:        this.setElement.bind(this),
                className: this.getClassName(),
                type:      'input',
                inputType: 'button',
                tabIndex:  this._tabIndex,
                disabled:  this._disabled ? 'disabled' : '',
                value:     this._value || '',
                title:     this._hint ? '' : (this._title || ''),
                style:     style
            }
        );
    }

    onEvent(opts) {
        let element = this._element;
        if ('className' in opts) {
            this.setClassName(opts.className);
        }
        if ('color' in opts) {
            this.setColor(Component.getComponentColor(opts.color));
        }
        if ('value' in opts) {
            this.setValue(opts.value);
        }
        if ('title' in opts) {
            this.setTitle(opts.title);
        }
        if ('disabled' in opts) {
            element.disabled  = opts.disabled ? 'disabled' : '';
        }
        if ('width' in opts) {
            if (parseInt(opts.width, 10) >= 20) {
                this.setWidth(opts.width + 'px');
            } else {
                this.setWidth('auto');
            }
        }
        if ('height' in opts) {
            if (parseInt(opts.height, 10) >= 20) {
                this.setHeight(opts.height + 'px');
            } else {
                this.setHeight('auto');
            }
        }
        super.onEvent(opts);
    }

    onMouseMove(event) {
        if (!this._hint) {
            return;
        }
        let hintDiv;
        if (this._hintDiv) {
            hintDiv = this._hintDiv;
        } else {
            hintDiv = this.getHintDiv();
            if (!hintDiv) {
                return;
            }
            this._hintDiv     = hintDiv;
            hintDiv.innerHTML = this._hint.text;
        }
        let element = this._element;
        let offsetX = element.offsetLeft;
        let offsetY = element.offsetTop;
        let parent  = element.offsetParent;
        while (parent) {
            offsetX += parent.offsetLeft;
            offsetY += parent.offsetTop;
            parent = parent.offsetParent;
        }
        hintDiv.style.zIndex = 99999;
        hintDiv.style.display = 'block';
        hintDiv.style.left    = offsetX + (-hintDiv.offsetWidth / 2 + element.offsetWidth / 2 + (this._hint.offsetX || 0)) + 'px';
        hintDiv.style.top     = (offsetY + 35) + 'px';
    }

    onMouseOut() {
        this.hideHintDiv();
        this.onCancelEvent(event);
        if (!this._disabled) {
            this._onMouseOut && this._onMouseOut(event);
        }
    }

    onMouseDown() {
        this.hideHintDiv();
        if (!this._disabled) {
            this._element.focus();
            this._onMouseDown && this._onMouseDown(event);
        }
    }

    getHintDiv() {
        for (let i = 0; i < 10; i++) {
            let div = document.getElementById('hint' + i);
            if (div) {
                if (div._free) {
                    return div;
                }
            } else {
                div           = document.createElement('div');
                div.id        = 'hint' + i;
                div.className = 'hint with-arrow';
                div._free     = false;
                document.body.appendChild(div);
                return div;
            }
        }
        return null;
    }

    hideHintDiv() {
        if (this._hintDiv) {
            this._hintDiv.style.display = 'none';
            this._hintDiv._free         = true;
            this._hintDiv               = null;
        }
    }

    setElement(element) {
        super.setElement(element);
        element.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
};

exports.Component = exports.Button;
