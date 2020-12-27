/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const poweredUpModuleConstants = require('../../shared/vm/modules/poweredUpModuleConstants');
const spikeModuleConstants     = require('../../shared/vm/modules/spikeModuleConstants');
const platform                 = require('../lib/platform');
const dispatcher               = require('../lib/dispatcher').dispatcher;
const path                     = require('../lib/path');
const getDataProvider          = require('../lib/dataprovider/dataProvider').getDataProvider;
const Rtf                      = require('../program/output/Rtf').Rtf;
const SourceFormatter          = require('./source/SourceFormatter').SourceFormatter;
const SettingsState            = require('./settings/SettingsState');
const CompileAndRun            = require('./CompileAndRun').CompileAndRun;
const FormDialog               = require('./dialogs/form/FormDialog').FormDialog;

exports.IDEEvents = class extends CompileAndRun {
    onEditorChanged(info) {
        dispatcher.dispatch('Button.Compile.Change', {disabled: !info.canCompile});
    }

    onCancelCompile() {
        this._compiling = false;
    }

    onEditorsSetBreakpoint() {
        this.setBreakpoint();
    }

    // Buttons
    onButtonCompile() {
        this.compile({});
    }

    onButtonContinue() {
        this.onContinue('');
    }

    // File menu...
    onMenuFileNewFile(activeDirectory) {
        dispatcher.dispatch('Dialog.File.New.Show', 'File', activeDirectory);
    }

    onMenuFileNewProjectFile(activeDirectory) {
        dispatcher.dispatch('Dialog.File.New.Show', 'Project', activeDirectory);
    }

    onMenuFileNewImageFile(activeDirectory) {
        dispatcher.dispatch('Dialog.Image.New.Show', activeDirectory, this._settings.getDocumentPath());
    }

    onMenuFileNewFormFile(activeDirectory) {
        dispatcher.dispatch('Dialog.Form.New.Show', activeDirectory, this._settings.getDocumentPath());
    }

    onMenuFileOpen() {
        dispatcher.dispatch('Dialog.File.Show', {mode: 'openFile', index: 'main'});
    }

    onMenuFileSetup() {
        dispatcher.dispatch('Setup.Show', {canCancel: true});
    }

    // Edit menu...
    onResize() {
        let activeEditor = this._editor.getActiveEditor();
        if (activeEditor && activeEditor.getCanResize && activeEditor.getCanResize()) {
            dispatcher.dispatch('Dialog.Image.Resize.Show', activeEditor.getWidth(), activeEditor.getHeight());
        }
    }

    onFormatCode() {
        const formatCode = () => {
                let activeEditor = this._editor.getActiveEditor();
                if (activeEditor && activeEditor.getCanFormat && activeEditor.getCanFormat()) {
                    activeEditor.setValue(new SourceFormatter().format(activeEditor.getValue()));
                }
            };
        if (this._editor.hasCompilableFile() !== 1) {
            formatCode();
            return;
        }
        const confirmFormatCode = () => {
                dispatcher.dispatch(
                    'Dialog.Confirm.Show',
                    {
                        title:         'Your project does not compile',
                        lines:         ['Are you sure you format the code of this file?'],
                        applyCallback: formatCode
                    }
                );
            };
        dispatcher.dispatch(
            'Compile.Silent',
            (success) => {
                if (success) {
                    formatCode();
                } else {
                    confirmFormatCode();
                }
            }
        );
    }

    // Find menu...
    onFindFind() {
        this.callOnActiveEditor('showFindToolbar');
    }

    onFindFindNext() {
        this.callOnActiveEditor('findNext');
    }

    onFindReplace() {
        this.callOnActiveEditor('showReplaceToolbar');
    }

    onFindReplaceNext() {
        this.callOnActiveEditor('replaceNext');
    }

    // Compile menu...
    onMenuCompileCompile() {
        this.compile({});
    }

    onMenuCompileCompileAndRun() {
        this.compile({
            compileAndRun: true,
            documentPath:  this._settings.getDocumentPath()
        });
    }

    onMenuCompileCompileAndInstall() {
    }

    onMenuCompileStatistics() {
        dispatcher.dispatch('Dialog.Statistics.Show', {program: this._program});
    }

    // EV3 Menu...
    onMenuEV3Connect() {
        if (this._ev3.getConnected()) {
            dispatcher.dispatch(
                'Dialog.Alert.Show',
                {
                    title: 'Connected',
                    lines: [
                        this._ev3.getDeviceName(),
                        'Is connected.'
                    ]
                }
            );
        } else {
            dispatcher.dispatch('Dialog.ConnectEV3.Show');
            this.onSelectDeviceEV3();
        }
    }

    onMenuEV3DaisyChain() {
        const applyDeviceCount = (daisyChainMode) => {
                dispatcher
                    .dispatch('EV3.ActiveLayerCount', daisyChainMode)
                    .dispatch('Settings.Set.DaisyChainMode', daisyChainMode);
                this.onSelectDeviceEV3();
            };
        const selectDeviceCount = () => {
                dispatcher.dispatch(
                    'Dialog.DaisyChain.Show',
                    {
                        daisyChainMode: this._settings.getDaisyChainMode(),
                        applyCallback:  applyDeviceCount
                    }
                );
            };
        const disconnectAndSelectDeviceCount = () => {
                this._ev3.disconnect();
                selectDeviceCount();
            };
        if (this._spike.getConnected()) {
            dispatcher.dispatch(
                'Dialog.Confirm.Show',
                {
                    title:         'EV3 is connected',
                    lines:         ['To change the EV3 daisy chain mode you must disconnect first', 'Do you want to continue?'],
                    applyCallback: disconnectAndSelectDeviceCount
                }
            );
        } else {
            selectDeviceCount();
        }
    }

    onMenuEV3DirectControl() {
        dispatcher.dispatch(
            'Dialog.EV3Control.Show',
            {
                deviceCount: this._settings.getDaisyChainMode()
            }
        );
    }

    onMenuEV3StopAllMotors() {
        this._ev3.stopAllMotors();
    }

    // Powered Up Menu...
    onMenuPoweredUpConnect() {
        if (this._poweredUp.getConnectionCount() < this._settings.getPoweredUpDeviceCount()) {
            dispatcher.dispatch('Dialog.ConnectPoweredUp.Show');
            this.onSelectDevicePoweredUp();
        } else {
            let lines = ['You\'ve reached the maximum number of connections.'];
            if (this._poweredUp.getConnectionCount() < poweredUpModuleConstants.LAYER_COUNT) {
                lines.push('You can change this setting in the <i>PoweredUp</i> > <i>Device count</i> menu.');
            }
            dispatcher.dispatch('Dialog.Alert.Show', {title: 'Maximum connections reached', lines: lines});
        }
    }

    onMenuPoweredUpDisconnect() {
        this._poweredUp.disconnect();
    }

    onMenuPoweredUpAutoConnect() {
        dispatcher.dispatch('Dialog.AutoConnectPoweredUp.Show');
        this.onSelectDevicePoweredUp();
    }

    onMenuPoweredUpDeviceCount() {
        const applyDeviceCount = (deviceCount) => {
                dispatcher
                    .dispatch('PoweredUp.DeviceCount',             deviceCount)
                    .dispatch('Settings.Set.PoweredUpDeviceCount', deviceCount);
                this.onSelectDevicePoweredUp();
            };
        const selectDeviceCount = () => {
                dispatcher.dispatch(
                    'Dialog.DeviceCount.Show',
                    {
                        deviceCount: this._settings.getPoweredUpDeviceCount(),
                        layerCount:  poweredUpModuleConstants.POWERED_UP_LAYER_COUNT,
                        title:       'Number of Powered Up devices',
                        onApply:     applyDeviceCount
                    }
                );
            };
        const disconnectAndSelectDeviceCount = () => {
                this._poweredUp.disconnect();
                selectDeviceCount();
            };
        if (this._poweredUp.getConnected()) {
            dispatcher.dispatch(
                'Dialog.Confirm.Show',
                {
                    title:         'Powered Up is connected',
                    lines:         ['To change the Powered Up device count you must disconnect first', 'Do you want to continue?'],
                    applyCallback: disconnectAndSelectDeviceCount
                }
            );
        } else {
            selectDeviceCount();
        }
    }

    onMenuPoweredUpDirectControl() {
        dispatcher.dispatch(
            'Dialog.PoweredUpControl.Show',
            {
                deviceCount: this._settings.getPoweredUpDeviceCount(),
                withAlias:   true
            }
        );
    }

    onMenuDownloadInstallCompiledFiles() {
        dispatcher.dispatch(
            'Dialog.Download.Show',
            {
                filename:  this._projectFilename,
                resources: this._preProcessor.getResources(),
                program:   this._program
            }
        );
    }

    // Spike Menu...
    onMenuSpikeConnect() {
        if (this._spike.getConnectionCount() < this._settings.getSpikeDeviceCount()) {
            dispatcher.dispatch('Dialog.ConnectSpike.Show');
            this.onSelectDeviceSpike();
        } else {
            let lines = ['You\'ve reached the maximum number of connections.'];
            if (this._spike.getConnectionCount() < spikeModuleConstants.LAYER_COUNT) {
                lines.push('You can change this setting in the <i>Spike</i> > <i>Device count</i> menu.');
            }
            dispatcher.dispatch('Dialog.Alert.Show', {title: 'Maximum connections reached', lines: lines});
        }
    }

    onMenuSpikeDisconnect() {
        this._spike.disconnect();
    }

    onMenuSpikeDeviceCount() {
        const applyDeviceCount = (deviceCount) => {
                dispatcher
                    .dispatch('Spike.DeviceCount',             deviceCount)
                    .dispatch('Settings.Set.SpikeDeviceCount', deviceCount);
                this.onSelectDeviceSpike();
            };
        const selectDeviceCount = () => {
                dispatcher.dispatch(
                    'Dialog.DeviceCount.Show',
                    {
                        deviceCount: this._settings.getSpikeDeviceCount(),
                        layerCount:  spikeModuleConstants.SPIKE_LAYER_COUNT,
                        title:       'Number of Spike devices',
                        onApply:     applyDeviceCount
                    }
                );
            };
        const disconnectAndSelectDeviceCount = () => {
                this._spike.disconnect();
                selectDeviceCount();
            };
        if (this._spike.getConnected()) {
            dispatcher.dispatch(
                'Dialog.Confirm.Show',
                {
                    title:         'Spike is connected',
                    lines:         ['To change the Spike device count you must disconnect first', 'Do you want to continue?'],
                    applyCallback: disconnectAndSelectDeviceCount
                }
            );
        } else {
            selectDeviceCount();
        }
    }

    onMenuSpikeDirectControl() {
        dispatcher.dispatch(
            'Dialog.SpikeControl.Show',
            {
                deviceCount: this._settings.getSpikeDeviceCount(),
                withAlias:   false
            }
        );
    }

    // About menu...
    onMenuAboutVersion() {
        let settings = this._settings;
        settings.load(() => {
            let os = settings.getOS();
            let info;
            if (platform.isNode()) {
                info = 'Version: ' + settings.getVersion() + ', Platform: NodeJS';
            } else if (platform.isElectron()) {
                info = 'Version: ' + settings.getVersion() + ', Platform: ' + os.platform + ', Arch: ' + os.arch;
            } else {
                info = 'Version: ' + settings.getVersion() + ', Platform: ' + navigator.product;
            }
            dispatcher.dispatch(
                'Dialog.Alert.Show',
                {
                    title: 'Wheel',
                    image: 'images/logos/logo.png',
                    lines: [info]
                }
            );
        });
    }

    onMenuAboutWebsite() {
        if (platform.isElectron()) {
            const shell = require('electron').shell;
            shell.openExternal('https://arnovandervegt.github.io/wheel/');
        } else {
            window.open('https://arnovandervegt.github.io/wheel/', 'wheel_github');
        }
    }

    onMenuAboutReportIssue() {
        if (platform.isElectron()) {
            const shell = require('electron').shell;
            shell.openExternal('https://github.com/ArnoVanDerVegt/wheel/issues');
        } else {
            window.open('https://github.com/ArnoVanDerVegt/wheel/issues', 'wheel_github');
        }
    }

    onCompileSilent(finishedCallback) {
        // Compile silent, don't show any messages...
        this.compile({
            compileSilent:    true,
            finishedCallback: finishedCallback
        });
    }

    onShowForm(data) {
        if (!this._vm || !this._vm.running()) {
            return;
        }
        let componentFormContainer = this._componentFormContainer;
        let formDialogs            = this._formDialogs;
        let index                  = formDialogs.length;
        formDialogs.push(new FormDialog({
            ide:                    this,
            settings:               this._settings,
            ui:                     this._ui,
            vm:                     this._vm,
            program:                this._program,
            componentFormContainer: componentFormContainer,
            getDataProvider:        getDataProvider,
            data:                   data,
            onHide: function(uiId) {
                componentFormContainer.removeWindow(uiId);
                formDialogs[index] = null;
            }
        }).show());
    }

    onMenuModuleLoad(opts) {
        this._editor.add({
            value:    this._exportsByUrl[opts.url],
            filename: filename,
            path:     'lib/' + opts.filename
        });
    }

    onEV3Connecting() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_INFO,
                message: 'Connecting to EV3...'
            }
        );
    }

    onEV3Connected() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_HINT,
                message: 'Connected to EV3.'
            }
        );
    }

    onEV3Disconnect() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_HINT,
                message: 'EV3 Disconnected.'
            }
        );
    }

    onPoweredUpConnecting(hub) {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_INFO,
                message: 'Connecting to Powered Up <i>' + hub.title + '</i>...'
            }
        );
    }

    onPoweredUpConnected() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_HINT,
                message: 'Connected to Powered Up.'
            }
        );
    }

    onPoweredUpDisconnect() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_HINT,
                message: 'Powered Up disconnected.'
            }
        );
    }

    onSpikeConnecting(hub) {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_INFO,
                message: 'Connecting to Spike...'
            }
        );
    }

    onSpikeConnected() {
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_HINT,
                message: 'Connected to Spike.'
            }
        );
    }

    onCreatedPreProcessor(preProcessor) {
        this._editor.setPreProcessor(this._preProcessor);
        dispatcher.dispatch('Console.PreProcessor', this._preProcessor);
    }

    onBreakpoint(vm, breakpoint) {
        this._editor.onBreakpoint(breakpoint);
        dispatcher.dispatch('Console.Breakpoint', breakpoint);
        let formDialogs = this._formDialogs;
        for (let i = formDialogs.length - 1; i >= 0; i--) {
            formDialogs[i].hideForBreakpoint();
        }
    }

    onCompilerError(opts) {
        if (this._compileSilent) {
            return;
        }
        dispatcher
            .dispatch('Console.Error',                opts)
            .dispatch('Compile.Failed',               this._projectFilename)
            .dispatch('Settings.Set.Console.Visible', true);
        this._compileAndRun = false;
    }

    onBeforeCompile() {
        if (this._compileSilent) {
            return;
        }
        this._editor.hideBreakpoint();
        dispatcher
            .dispatch('Button.Run.Change', {disabled: true})
            .dispatch('Compile.Start',     this._projectFilename)
            .dispatch('Console.Clear');
    }

    onGetSource(callback) {
        this._editor.getValue(
            (info) => {
                if (info) {
                    this._projectFilename = info.filename;
                    this._source          = info.source;
                }
                callback(!!info);
            },
            this._compileSilent // If compiling silent then the select project dialog will be suppresed!
        );
    }

    onCompileSuccess(program, lineCount) {
        if (this._compileSilent) {
            return;
        }
        if (this._linter) {
            this.showLinterMessages();
        }
        dispatcher
            .dispatch('Compile.Success',   this._projectFilename)
            .dispatch('Button.Run.Change', {disabled: false});
        let leadingZero     = function(v) { return ('00' + v).substr(-2); };
        let date            = new Date();
        let time            = leadingZero(date.getHours()) + ':' +
                                leadingZero(date.getMinutes()) + ':' +
                                leadingZero(date.getSeconds());
        let pathAndFilename = path.getPathAndFilename(this._projectFilename);
        dispatcher.dispatch(
            'Console.Log',
            {
                type:    SettingsState.CONSOLE_MESSAGE_TYPE_INFO,
                message: time + ' <i>' + pathAndFilename.filename + '</i> ' +
                    'Compiled ' + lineCount + ' lines, ' +
                    'generated ' + program.getLength() + ' commands.'
            }
        );
        if (this._settings.getCreateVMTextOutput()) {
            this.showOutput(program);
        }
        this._compileAndRunOutput
            .setProjectFilename(this._projectFilename)
            .setPreProcessor(this._preProcessor)
            .setSimulatorModules(this._simulatorModules)
            .saveOutput(new Rtf(program).getOutput());
        if (this._compileAndRun) {
            this._compileAndRun = false;
            setTimeout(this.run.bind(this), 200);
        }
        this._compileAndRunInstall
            .setEV3(this._ev3)
            .setProgram(this._program)
            .setPreProcessor(this._preProcessor)
            .setProjectFilename(this._projectFilename)
            .installProgram();
    }

    onBeforeRun(program) {
        let settings = this._settings;
        if (settings.getShowSimulatorOnRun() && !settings.getShowSimulator()) {
            dispatcher.dispatch('Settings.Toggle.ShowSimulator');
        }
        program.setBreakpoints(this._editor.getBreakpoints());
    }

    onStop() {
        if (this._vm) {
            this._vm.stop();
            dispatcher.dispatch('Button.Run.Change', {value: 'Run'});
            this.simulatorLoaded();
        }
    }

    onVMStop() {
        // Close all open windows when the VM stops...
        let formDialogs = this._formDialogs;
        for (let i = 0; i < formDialogs.length; i++) {
            if (formDialogs[i]) {
                formDialogs[i].hide();
                formDialogs[i] = null;
            }
        }
    }

    onContinue() {
        if (this._vm.getBreakpoint()) {
            this._editor.hideBreakpoint();
            this._formDialogs.forEach((dialog) => {
                dialog.showForBreakpoint();
            });
            if (!this._changedWhileRunning) {
                this._program.setBreakpoints(this._editor.getBreakpoints());
            }
            this._vm.continueAfterBreakpoint();
        }
    }

    onSaveAs() {
        let activeEditor = this._editor.getActiveEditor();
        if (!activeEditor) {
            return;
        }
        dispatcher.dispatch(
            'Dialog.File.Show',
            {
                mode:     'saveFile',
                path:     activeEditor.getPath(),
                filename: activeEditor.getFilename()
            }
        );
    }

    onExit() {
        let ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.send('postMessage', {command: 'quit'});
    }

    onEditorSetBreakpoint() {
        if (this._vm && this._vm.getBreakpoint() && !this._changedWhileRunning) {
            this._program.setBreakpoints(this._editor.getBreakpoints());
        }
    }

    onEditorsChanged() {
        this.setChangedWhileRunning(true);
    }

    onViewChanged() {
        if (typeof document === 'undefined') {
            return;
        }
        let items             = ['ide'];
        let settings          = this._settings;
        let noSimulator       = !settings.getShowSimulator();
        let noProperties      = !settings.getShowProperties();
        let showFileTree      = settings.getShowFileTree();
        let showQuickViewMenu = settings.getShowQuickViewMenu();
        let showConsole       = settings.getShowConsole();
        let darkMode          = settings.getDarkMode();
        let os                = settings.getOS();
        noSimulator && noProperties && items.push('no-right-panel');
        noSimulator                 && items.push('no-simulator');
        noProperties                && items.push('no-properties');
        showFileTree                || items.push('no-file-tree');
        showQuickViewMenu           || items.push('no-quick-view-menu');
        showConsole                 || items.push('no-console');
        darkMode                    && items.push('dark');
        (os.platform === 'darwin') || items.push('scroll-bar');
        if (document.body) {
            document.body.className = items.join(' ');
        }
    }
};
