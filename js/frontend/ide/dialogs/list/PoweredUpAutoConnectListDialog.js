/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher          = require('../../../lib/dispatcher').dispatcher;
const getDataProvider     = require('../../../lib/dataprovider/dataProvider').getDataProvider;
const platform            = require('../../../lib/platform');
const ListDialog          = require('./ListDialog').ListDialog;
const AutoConnectListItem = require('./components/AutoConnectListItem').AutoConnectListItem;

exports.PoweredUpAutoConnectListDialog = class extends ListDialog {
    constructor(opts) {
        opts.help        = 'Bluetooth';
        opts.title       = 'Auto connect Powered Up';
        opts.applyTitle  = null;
        opts.cancelTitle = 'Close';
        opts.ListItem    = AutoConnectListItem;
        super(opts);
        dispatcher.on('Dialog.AutoConnectPoweredUp.Show', this, this.onShow);
    }

    getList() {
        getDataProvider().getData(
            'post',
            'powered-up/connected-device-list',
            {
                autoConnect: this._settings.getPoweredUpAutoConnect().toJSON()
            },
            (data) => {
                try {
                    data = JSON.parse(data);
                } catch (error) {
                    data = null;
                }
                if (data) {
                    let list = [];
                    data.list.forEach(function(item) {
                        if (item) {
                            if (!item.title) {
                                item.title = '??';
                            }
                            list.push(item);
                        }
                    });
                    this.onDeviceList(list);
                }
            }
        );
    }

    onApply() {
    }

    onSelectItem(index) {
        this.onApply();
    }

    onShow() {
        this.show();
        this.getList();
    }

    onDeviceList(list) {
        this._list = list;
        this.showList(list);
        this._refs.buttonCancel.focus();
    }
};
