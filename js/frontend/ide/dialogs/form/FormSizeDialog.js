/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher  = require('../../../lib/dispatcher').dispatcher;
const ImageDialog = require('../image/ImageDialog').ImageDialog;

exports.FormSizeDialog = class extends ImageDialog {
    constructor(opts) {
        opts.minWidth  = 128;
        opts.maxWidth  = 800;
        opts.minHeight = 128;
        opts.maxHeight = 600;
        super(opts);
        this.initWindow({
            showSignal: 'Dialog.Form.SetSize',
            width:      400,
            height:     216,
            className:  'image-dialog',
            title:      'Set form size'
        });
    }

    initWindowContent(opts) {
        return [
            {
                className: 'abs dialog-cw dialog-lt image-dialog-text',
                children: [
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
        ];
    }

    onShow(width, height) {
        super.show();
        let refs = this._refs;
        refs.width.setValue(width);
        refs.height.setValue(height);
        refs.width.focus();
    }

    onApply() {
        if (!this.validate()) {
            return;
        }
        dispatcher.dispatch('OnSetFormSize', this._width, this._height);
        this.hide();
    }
};
