/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const Dialog = require('../../../lib/components/Dialog').Dialog;

exports.ImageDialog = class extends Dialog {
    show() {
        let refs = this._refs;
        refs.width
            .setValue(178)
            .setClassName('');
        refs.height
            .setValue(128)
            .setClassName('');
        super.show();
    }

    validateWidth() {
        let result = true;
        let refs   = this._refs;
        this._width = parseInt(refs.width.getValue().trim(), 10);
        if (isNaN(this._width) || (this._width < 1) || (this._width > 178)) {
            refs.width.setClassName('invalid');
            result = false;
        } else {
            refs.width.setClassName('');
        }
        return result;
    }

    validateHeight() {
        let result = true;
        let refs   = this._refs;
        this._height = parseInt(refs.height.getValue().trim(), 10);
        if (isNaN(this._height) || (this._height < 1) || (this._height > 128)) {
            refs.height.setClassName('invalid');
            result = false;
        } else {
            refs.height.setClassName('');
        }
        return result;
    }

    validate() {
        let result = this.validateWidth();
        if (result) {
            result = this.validateHeight();
        }
        return result;
    }

    getWidthRow() {
        return {
            className: 'image-dialog-row',
            children: [
                {
                    innerHTML: 'Width'
                },
                this.addTextInput({
                    ref:      this.setRef('width'),
                    tabIndex: 10,
                    onKeyUp:  this.onWidthKeyUp.bind(this)
                })
            ]
        };
    }

    getHeightRow() {
        return {
            className: 'image-dialog-row',
            children: [
                {
                    innerHTML: 'Height'
                },
                this.addTextInput({
                    ref:      this.setRef('height'),
                    tabIndex: 11,
                    onKeyUp:  this.onHeightKeyUp.bind(this)
                })
            ]
        };
    }

    onWidthKeyUp(event) {
        if ((event.keyCode === 13) && this.validateWidth()) {
            this._refs.height.focus();
        }
    }

    onHeightKeyUp() {
        if ((event.keyCode === 13) && this.validateHeight() && this.onApply) {
            this.onApply();
        }
    }
};
