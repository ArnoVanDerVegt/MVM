/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../../lib/dispatcher').dispatcher;
const Dialog     = require('../../lib/components/Dialog').Dialog;

const license = [
        'Copyright (c) 2017 - Present | Arno van der Vegt',
        '',
        'Permission is hereby granted, free of charge, to any person',
        'obtaining a copy of this software and associated documentation',
        'files (the "Software"), to deal in the Software without ',
        'restriction, including without limitation the rights',
        'to use, copy, modify, merge, publish, distribute, sublicense,',
        'and/or sell copies of the Software, and to permit persons to',
        'whom the Software is furnished to do so, subject to the following',
        'conditions:',
        '',
        'The above copyright notice and this permission notice shall be',
        'included in all copies or substantial portions of the Software. ',
        '',
        'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,',
        'EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES',
        'OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND',
        'NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT',
        'HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,',
        'WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING',
        'FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR',
        'OTHER DEALINGS IN THE SOFTWARE.'
    ];

const SHOW_SIGNAL = 'Dialog.License.Show';

exports.LicenseDialog = class extends Dialog {
    constructor(opts) {
        super(opts);
        this.initWindow({
            showSignal: SHOW_SIGNAL,
            width:      600,
            height:     600,
            className:  'no-select license-dialog',
            title:      'MIT License'
        });
    }

    initWindowContent(opts) {
        return [
            {
                type:      'pre',
                className: 'abs dialog-cw dialog-lt ui1-box vscroll pad license-text',
                innerHTML: license.join('\n')
            },
            this.initButtons([
                {
                    ref:      this.setRef('okButton'),
                    tabIndex: 128,
                    value:    'Ok',
                    onClick:  this.hide.bind(this)
                }
            ])
        ];
    }

    onShow() {
        this.show();
        this._refs.okButton.focus();
    }
};

exports.LicenseDialog.SHOW_SIGNAL = SHOW_SIGNAL;
