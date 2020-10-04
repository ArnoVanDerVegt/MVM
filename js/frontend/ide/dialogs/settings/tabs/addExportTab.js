/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const ExportSettings = require('../components/ExportSettings').ExportSettings;

exports.tab = (settingsDialog, opts) => {
    return {
        ref:       settingsDialog.setRef('tabExport'),
        className: 'abs max-x tab-panel ui1-box vscroll tab-export',
        children: [
            {
                type:     ExportSettings,
                ref:      settingsDialog.setRef('export'),
                ui:       opts.ui,
                uiId:     opts.uiId,
                settings: opts.settings
            }
        ]
    };
};
