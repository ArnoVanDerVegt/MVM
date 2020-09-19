/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../../../lib/dispatcher').dispatcher;
const Dialog     = require('../../../lib/components/Dialog').Dialog;
const Dropdown   = require('../../../lib/components/Dropdown').Dropdown;

exports.DeviceCountDialog = class extends Dialog {
    constructor(opts) {
        super(opts);
        this.initWindow({
            showSignal: 'Dialog.DeviceCount.Show',
            width:      480,
            height:     180,
            className:  'device-count-dialog',
            title:      'Number of Powered Up devices',
            help:       'Powered'
        });
    }

    initWindowContent() {
        return [
            {
                type:      Dropdown,
                ref:       this.setRef('deviceCount'),
                ui:        this._ui,
                uiId:      this._uiId,
                className: 'abs dialog-lt',
                tabIndex:  1,
                items: [
                    {value: 1, title: '1 Device'},
                    {value: 2, title: '2 Devices'},
                    {value: 3, title: '3 Devices'},
                    {value: 4, title: '4 Devices'},
                    {value: 5, title: '5 Devices'},
                    {value: 6, title: '6 Devices'},
                    {value: 7, title: '7 Devices'},
                    {value: 8, title: '8 Devices'}
                ]
            },
            this.initButtons([
                {
                    tabIndex: 128,
                    value:    'Set device count',
                    onClick:  this.onApply.bind(this)
                }
            ])
        ];
    }

    onApply() {
        this.hide();
        let deviceCount = this._refs.deviceCount.getValue();
        dispatcher.dispatch('PoweredUp.DeviceCount', deviceCount);
        dispatcher.dispatch('Settings.Set.DeviceCount', deviceCount);
    }

    onShow(deviceCount) {
        this.show();
        this._refs.deviceCount.setValue(deviceCount);
    }
};
