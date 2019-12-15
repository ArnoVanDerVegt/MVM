/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher  = require('../../../lib/dispatcher').dispatcher;
const path        = require('../../../lib/path');
const ImageDialog = require('./ImageDialog').ImageDialog;

exports.ImageNewDialog = class extends ImageDialog {
    constructor(opts) {
        super(opts);
        this.createWindow(
            'image-dialog new-image',
            'New image',
            [
                {
                    className: 'image-dialog-text',
                    children: [
                        {
                            className: 'image-dialog-row',
                            children: [
                                {
                                    innerHTML: 'Filename'
                                },
                                this.addTextInput({
                                    ref:      this.setRef('filename'),
                                    tabIndex: 1,
                                    onKeyUp:  this.onFilenameKeyUp.bind(this)
                                })
                            ]
                        },
                        this.getWidthRow(),
                        this.getHeightRow()
                    ]
                },
                {
                    className: 'buttons',
                    children: [
                        this.addButton({
                            ref:      this.setRef('buttonApply'),
                            tabIndex: 128,
                            value:    'Ok',
                            onClick:  this.onApply.bind(this)
                        }),
                        this.addButton({
                            tabIndex: 129,
                            value:    'Cancel',
                            color:    'dark-green',
                            onClick:  this.hide.bind(this)
                        })
                    ]
                }
            ]
        );
        dispatcher.on('Dialog.Image.New.Show', this, this.onShow);
    }

    onShow(activeDirectory, documentPath) {
        super.show();
        this._activeDirectory         = activeDirectory || documentPath;
        this._refs.filename.className = '';
        this._refs.filename.value     = '';
        this._refs.filename.focus();
    }

    onFilenameKeyUp(event) {
        if ((event.keyCode === 13) && this.validateFilename()) {
            this._refs.width.focus();
        }
    }

    onApply() {
        if (!this.validate()) {
            return;
        }
        let extension = path.getExtension(this._filename);
        if (extension === '') {
            this._filename += '.rgf';
        }
        let filename = path.join(this._activeDirectory, this._filename);
        dispatcher.dispatch('Create.Image', filename, this._width, this._height);
        this.hide();
    }

    validateFilename() {
        let result = true;
        let refs   = this._refs;
        this._filename = refs.filename.getValue().trim();
        let extension = path.getExtension(this._filename);
        if ((this._filename === '') || (['', '.rgf'].indexOf(extension) === -1)) {
            refs.filename.focus();
            refs.filename.setClassName('invalid');
            result = false;
        } else {
            refs.filename.setClassName('');
        }
        return result;
    }

    validate() {
        let result = this.validateFilename();
        if (result) {
            result = super.validate();
        }
        return result;
    }
};
