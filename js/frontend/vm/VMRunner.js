/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const ipcRenderer                = require('electron').ipcRenderer;
const DOMNode                    = require('../lib/dom').DOMNode;
const dispatcher                 = require('../lib/dispatcher').dispatcher;
const Button                     = require('../lib/components/input/Button').Button;
const getDataProvider            = require('../lib/dataprovider/dataProvider').getDataProvider;
const Program                    = require('../program/Program').Program;
const getImage                   = require('../ide/data/images').getImage;
const EV3ConnectListDialog       = require('../ide/dialogs/connection/EV3ConnectListDialog').EV3ConnectListDialog;
const PoweredUpConnectListDialog = require('../ide/dialogs/connection/PoweredUpConnectListDialog').PoweredUpConnectListDialog;
const SpikeConnectListDialog     = require('../ide/dialogs/connection/SpikeConnectListDialog').SpikeConnectListDialog;
const NXTConnectListDialog       = require('../ide/dialogs/connection/NXTConnectListDialog').NXTConnectListDialog;
const FormDialog                 = require('../ide/dialogs/form/FormDialog').FormDialog;
const ComponentFormContainer     = require('../ide/dialogs/form/ComponentFormContainer').ComponentFormContainer;
const VM                         = require('./VM').VM;
const vmModuleLoader             = require('./vmModuleLoader');

exports.VMRunner = class extends DOMNode {
    constructor(opts) {
        super(opts);
        this._hasMainWindow          = false;
        this._formDialogs            = [];
        this._devices                = opts.devices;
        this._projectFilename        = opts.projectFilename;
        this._settings               = opts.settings;
        this._ui                     = opts.ui;
        this._componentFormContainer = new ComponentFormContainer();
        this._program                = new Program(null).load(opts.program);
        if (this._settings.getDarkMode()) {
            document.body.className = 'ide dark';
        }
        this
            .initDOM()
            .initDialogs()
            .initPoweredUp();
        dispatcher.on('Form.Show', this, this.onShowForm);
    }

    initDOM() {
        let src = 'images/logos/wheel' + (this._settings.getDarkMode() ? 'White' : 'Black') + '.svg';
        this.create(
            document.body,
            {
                className: 'runner',
                children: [
                    {
                        className: 'runner-vcenter',
                        children: [
                            {
                                className: 'runner-hcenter',
                                children: [
                                    {
                                        type:      'img',
                                        src:       getImage(src),
                                        width:     128,
                                        height:    128
                                    },
                                    {
                                        className: 'program',
                                        innerHTML: 'Progam: ' + this._program.getTitle()
                                    },
                                    {
                                        ref:       this.setRef('targetPlatform'),
                                        className: 'target-platform',
                                        innerHTML: 'No device selected'
                                    },
                                    this.initButtons()
                                ]
                            }
                        ]
                    }
                ]
            }
        );
        return this;
    }

    initButtons() {
        return {
            className: 'buttons',
            children: [
                {
                    type:      Button,
                    tabIndex:  1,
                    ui:        this._ui,
                    value:     'Run',
                    className: 'run',
                    onClick:   this.onClickRun.bind(this)
                },
                {
                    type:      Button,
                    tabIndex:  1,
                    ui:        this._ui,
                    color:     'blue',
                    value:     'Spike',
                    className: 'connect',
                    onClick:   this.onClickConnectSpike.bind(this)
                },
                {
                    type:      Button,
                    tabIndex:  1,
                    ui:        this._ui,
                    color:     'blue',
                    value:     'Powered Up',
                    className: 'connect',
                    onClick:   this.onClickConnectPoweredUp.bind(this)
                },
                {
                    type:      Button,
                    tabIndex:  1,
                    ui:        this._ui,
                    color:     'blue',
                    value:     'EV3',
                    className: 'connect',
                    onClick:   this.onClickConnectEV3.bind(this)
                },
                {
                    type:      Button,
                    tabIndex:  1,
                    ui:        this._ui,
                    color:     'blue',
                    value:     'NXT',
                    className: 'connect',
                    onClick:   this.onClickConnectNXT.bind(this)
                }
            ]
        };
    }

    initDialogs() {
        new EV3ConnectListDialog      ({getImage: getImage, ui: this._ui, settings: this._settings});
        new PoweredUpConnectListDialog({getImage: getImage, ui: this._ui, settings: this._settings});
        new NXTConnectListDialog      ({getImage: getImage, ui: this._ui, settings: this._settings});
        new SpikeConnectListDialog    ({getImage: getImage, ui: this._ui, settings: this._settings});
        return this;
    }

    initPoweredUp() {
        let dataProvider = getDataProvider();
        dataProvider.getData('post', 'powered-up/disconnect-all', {},                (data) => {});
        dataProvider.getData('post', 'powered-up/discover',       {autoConnect: []}, (data) => {});
        return this;
    }

    getComponentFormContainer() {
        return this._componentFormContainer;
    }

    getProjectFilename() {
        return this._projectFilename;
    }

    getNextWinUiId() {
        return this._componentFormContainer.peekUiId();
    }

    getEditor() {
        return null;
    }

    getModules(vm) {
        let device = () => {
                switch (this._settings.getActiveDevice()) {
                    case 0: return this._devices.nxt;
                    case 1: return this._devices.ev3;
                    case 2: return this._devices.poweredUp;
                    case 3: return this._devices.spike;
                }
                return this._devices.ev3;
            };
        this._localModules = !device().getConnected();
        return vmModuleLoader.load(vm, this._localModules, device, this);
    }

    onShowForm(data) {
        if (!this._vm || !this._vm.running()) {
            return;
        }
        let componentFormContainer = this._componentFormContainer;
        let formDialogs            = this._formDialogs;
        let index                  = formDialogs.length;
        let canClose               = true;
        if (!this._hasMainWindow) {
            canClose            = false;
            this._hasMainWindow = true;
            ipcRenderer.send(
                'postMessage',
                {
                    command: 'vmWindowResize',
                    width:  parseInt(data[0].width,  10),
                    height: parseInt(data[0].height, 10) + 80
                }
            );
        }
        formDialogs.push(new FormDialog({
            ide:                    this,
            settings:               this._settings,
            ui:                     this._ui,
            vm:                     this._vm,
            program:                this._program,
            canClose:               canClose,
            componentFormContainer: componentFormContainer,
            getDataProvider:        getDataProvider,
            data:                   data,
            onHide: function(uiId) {
                componentFormContainer.removeWindow(uiId);
                formDialogs[index] = null;
            }
        }).show());
    }

    onClickRun() {
        let program = this._program;
        this._vm = new VM({
                entryPoint:  program.getEntryPoint(),
                globalSize:  program.getGlobalSize(),
                constants:   program.getConstants(),
                stringList:  program.getStringList(),
                heap:        program.getHeap(),
                dataType:    program.getDataType(),
                sortedFiles: []
            });
        this._vm
            .setModules(this.getModules(this._vm))
            .setCommands(program.getCommands())
            .setOutputPath(''); // Todo: this._outputPath
        this._vm.startRunInterval(this.stop.bind(this));
    }

    onClickConnectPoweredUp() {
        this._refs.targetPlatform.innerHTML = 'Device: Powered Up';
        dispatcher.dispatch('Dialog.ConnectPoweredUp.Show');
    }

    onClickConnectEV3() {
        this._refs.targetPlatform.innerHTML = 'Device: EV3';
        dispatcher.dispatch('Dialog.ConnectEV3.Show');
    }

    onClickConnectNXT() {
        this._refs.targetPlatform.innerHTML = 'Device: NXT';
        dispatcher.dispatch('Dialog.ConnectNXT.Show');
    }

    onClickConnectSpike() {
        this._refs.targetPlatform.innerHTML = 'Device: Spike';
        dispatcher.dispatch('Dialog.ConnectSpike.Show');
    }

    stop() {
    }
};
