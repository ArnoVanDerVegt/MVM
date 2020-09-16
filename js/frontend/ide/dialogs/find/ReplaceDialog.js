/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../../../lib/dispatcher').dispatcher;
const FindDialog = require('./FindDialog').FindDialog;

exports.ReplaceDialog = class extends FindDialog {
    constructor(opts) {
        super(opts);
        this.initWindow('find-dialog', 'Replace', this.initWindowContent(opts));
        dispatcher.on('Dialog.Replace.Show', this, this.onShow);
    }

    initWindowContent(opts) {
        return [
            {
                className: 'find-dialog-text',
                children: [
                    this.addTextInputRow({
                        title:      'Replace',
                        ref:        'replace',
                        tabIndex:    10,
                        onKeyUp:     this.onReplaceKeyUp.bind(this),
                        placeholder: 'Find text'
                    }),
                    this.addTextInputRow({
                        title:       'With',
                        ref:         'with',
                        tabIndex:    11,
                        onKeyUp:     this.onWithKeyUp.bind(this),
                        placeholder: 'Replace with text'
                    }),
                    this.addCheckboxRow({
                        title:       'Match case',
                        ref:         'caseSensitive',
                        tabIndex:    12
                    })
                ]
            },
            this.addButtons('Replace')
        ];
    }

    validateReplace() {
        let result = false;
        let refs   = this._refs;
        this._replace = refs.replace.getValue();
        if (this._replace === '') {
            refs.replace.setClassName('invalid');
        } else {
            refs.replace.setClassName('');
            result = true;
        }
        return result;
    }

    validate() {
        this._with = this._refs.with.getValue();
        return this.validateReplace();
    }

    onReplaceKeyUp(event) {
        if ((event.keyCode === 13) && this.validateReplace()) {
            this._refs.with.focus();
        }
    }

    onWithKeyUp() {
        if (event.keyCode === 13) {
            this.onApply();
        }
    }

    onShow() {
        super.show();
        this._refs.replace.focus();
    }

    onApply() {
        if (!this.validate()) {
            this._refs.replace.focus();
            return;
        }
        dispatcher.dispatch('Dialog.Replace.Replace', this._replace, this._with, this._refs.caseSensitive.getChecked());
        this.hide();
    }
};
