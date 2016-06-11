wheel(
    'components.editor.EditorComponent',
    React.createClass({
        getInitialState: function() {
            this.props.files.on(
                'Loaded',
                function() {
                    this.setState(this.state);

                    var activeFilename = LocalStorage.getInstance().get('activeFilename');
                    activeFilename && this.onSelectFile(activeFilename);
                }.bind(this)
            );
            this.props.vm.on(
                'Log',
                function(message, location) {
                    this.refs.console.addLog({
                        message:  message,
                        location: location
                    });
                }.bind(this)
            );
            return {
                small:           false,
                console:         false,
                activeFileIndex: 0,
                activeProject:   null
            }
        },

        getActiveFile: function() {
            var state     = this.state,
                files     = this.props.files;
            return files.getFile(state.activeFileIndex);
        },

        getSensorSettings: function() {
            var localStorage   = LocalStorage.getInstance();
            var sensorSettings = localStorage.get(
                    'sensorSettings',
                    {
                        sensor1: true,
                        sensor2: true,
                        sensor3: true,
                        sensor4: true
                    }
                );

            return sensorSettings;
        },

        setResizeListener: function(resizeListener) {
            this._resizeListener = resizeListener;
        },

        updateFiles: function() {
            var files = this.refs.files;
            files.setState(files.state);
        },

        onShowProject: function() {
            if (this.state.activeProject === null) {
                return;
            }
            this.onSelectFile(this.state.activeProject.filename);
        },

        onRun: function() {
            if (this.state.activeProject === null) {
                var alertDialog = this.refs.alertDialog;
                alertDialog.setState({
                    visible: true,
                    icon:    'icon-triangle-warning',
                    content: 'There is no project selected yet. You can select a project by finding a .whlp file in the project folders.',
                    title:   'Run - No project selected',
                });
                return;
            }

            var file = this.getActiveFile();
            if (file) {
                file.setData(this.refs.codeMirror.getCode(), true);
            }

            this.refs.console.clearMessages();

            var refs           = this.refs;
            var props          = this.props;
            var compiler       = props.compiler;
            var vm             = props.vm;
            var files          = props.files;
            var activeProject  = this.state.activeProject;
            var path           = activeProject.path;
            var filename       = activeProject.filename;
            var outputCommands = null;

            //try {
                var preProcessor = new wheel.compiler.PreProcessor({files: files});

                if (files.exists(filename)) {
                    preProcessor.process(
                        path,
                        filename,
                        function(includes) {
                            //try {
                                outputCommands = compiler.compile(includes);
                                var codeMirror = this.refs.codeMirror;
                                codeMirror.setHighlight({}) || codeMirror.update();
                            /*} catch (error) {
                                var location     = error.location || { filename: ' ', lineNumber: 0 },
                                    index         = files.exists(location.filename);

                                if (index !== false) {
                                    var file = files.getFile(index),
                                        meta = file.getMeta();
                                    if (!('highlightLines' in meta)) {
                                        meta.highlightLines = {};
                                    }
                                    meta.highlightLines[location.lineNumber] = { className: 'line-error' };
                                }

                                this.onSelectFile(location.filename);

                                this.refs.console.addError(error);

                                outputCommands = null;
                            }*/
                            if (outputCommands !== null) {
                                var onResourcesLoaded = (function() {
                                        var compilerData = compiler.getCompilerData();
                                        this.refs.console.setGlobals(compilerData.getGlobalList());
                                        vm.getModule(1).setEV3Screen(refs.output.refs.screen.getEV3Screen());
                                        vm.run(
                                            outputCommands,
                                            compilerData.getStringList(),
                                            compilerData.getGlobalConstants(),
                                            compilerData.getGlobalOffset(),
                                            preProcessor.getResources()
                                        );
                                    }).bind(this);

                                if (preProcessor.getResourceCount()) {
                                    preProcessor.once('ResourcesLoaded', onResourcesLoaded);
                                } else {
                                    onResourcesLoaded();
                                }
                            }
                        }.bind(this)
                    );
                }
            //} catch (error) {
            //    console.error(error);
            //}
        },

        onNew: function() {
            var newDialog = this.refs.newDialog;
            newDialog.setState({
                visible:    true,
                activeFile: this.getActiveFile(),
                onConfirm:  function(filename) {
                    var state   = this.state;
                    var files   = this.props.files;
                    var file    = this.getActiveFile();
                    var newFile = {
                            name: filename,
                            data: 'number a',
                            open: true
                        };

                    file && file.setData(this.refs.codeMirror.getCode());

                    files.createFile(newFile);
                    state.activeFileIndex = files.exists(newFile.name);
                    this.refs.codeMirror.setCode(newFile.data, filename);

                    this.setState(state);
                }.bind(this)
            });
        },

        onSave: function() {
            var file = this.getActiveFile();
            if (file) {
                file.setData(this.refs.codeMirror.getCode(), true);
                file.save();
                this.updateFiles();
            }
        },

        onFormatCode: function() {
            var file = this.getActiveFile();
            if (file) {
                file.setData(this.refs.codeMirror.formatCode());
                this.updateFiles();
            }
        },

        onSelectAll: function() {
            this.refs.codeMirror.selectAll();
        },

        onFind: function() {
            this.refs.codeMirror.find();
        },

        onFindNext: function() {
            this.refs.codeMirror.findNext();
        },

        onFindPrev: function() {
            this.refs.codeMirror.findPrev();
        },

        onUndo: function() {
            this.refs.codeMirror.undo();
        },

        onRedo: function() {
            this.refs.codeMirror.redo();
        },

        onMotors: function() {
            this.refs.motorsDialog.show();
        },

        onSensors: function() {
            this.refs.sensorsDialog.show(this.refs.output.setMotorInfo);
        },

        onExamples: function() {
            this.refs.examplesDialog.show((function(example) {
                this.openFile(example.filename);
            }).bind(this));
        },

        onSmall: function() {
            var state = this.state;
            state.small = true;
            this.setState(state);
            this.refs.codeMirror.setLarge();
            this.refs.console.setLarge();
        },

        onLarge: function() {
            var state = this.state;
            state.small = false;
            this.setState(state);
            this.refs.codeMirror.setSmall();
            this.refs.console.setSmall();
        },

        onSelectFile: function(filename) {
            var codeMirror = this.refs.codeMirror;
            var state      = this.state;
            var files      = this.props.files;
            var index      = files.exists(filename);

            if (index === false) {
                return;
            }

            var file = files.getFile(state.activeFileIndex);
            var changed;

            this.refs.files.showPath(filename);

            file.getDir() || file.setData(this.refs.codeMirror.getCode(), true);
            changed                 = (state.activeFileIndex !== index);
            state.activeFileIndex     = index;
            file                     = files.getFile(index);

            if (file.getDir()) {
                changed || file.setOpen(!file.getOpen());
                codeMirror.setReadOnly(true);
                codeMirror.setCode('', '');
                this.setState(this.state);
            } else {
                LocalStorage.getInstance().set('activeFilename', filename);
                file.getData(function(data) {
                    codeMirror.setReadOnly(false);
                    codeMirror.setCode(data, file.getName());
                    codeMirror.setHighlight(file.getMeta().highlightLines || {});
                    var filename = file.getName();
                    if (filename.substr(-5) == '.whlp') {
                        var lines = data.split("\n");
                        var name  = 'Project';
                        for (var i = 0; i < lines.length; i++) {
                            var line = lines[i].trim();
                            if (line.substr(0, 8) === '#project') {
                                line = line.substr(8 - line.length).trim();
                                if (line[0] === '"') {
                                    var j         = 1,
                                        name     = '';
                                    while (j < line.length) {
                                        if (line[j] === '"') {
                                            break;
                                        }
                                        name += line[j++];
                                    }
                                }
                                break;
                            }
                        }

                        state.activeProject = {
                            path:     file.getPath(),
                            filename: filename,
                            name:     name
                        }
                    }
                    this.setState(state);
                }.bind(this));
            }
        },

        onDeleteFile: function(index) {
            var state         = this.state;
            var files         = this.props.files;
            var file          = files.getFile(index);
            var confirmDialog = this.refs.confirmDialog;
            confirmDialog.setState({
                visible: true,
                icon:    'icon-triangle-warning',
                content: 'Are you sure you want to delete the file "' + file.getName() + '"?',
                title:   'Delete file',
                onConfirm: function() {
                    files.removeFile(
                        file.getName(),
                        function() {
                            var refs = this.refs;
                            state.activeFileIndex = 0;
                            file                  = files.getFile(0);
                            if (file) {
                                if (file.getDir()) {
                                    refs.files.setState(refs.files.state);
                                    refs.codeMirror.setReadOnly(true);
                                } else {
                                    file.getData(function(data) {
                                        refs.files.setState(refs.files.state);
                                        refs.codeMirror.setReadOnly(false);
                                        refs.codeMirror.setCode(data, file.getName());
                                    }.bind(this));
                                }
                            } else {
                                refs.files.setState(refs.files.state);
                            }
                        }.bind(this)
                    );
                }.bind(this)
            });
        },

        onDeleteDir: function(index) {
            var state         = this.state;
            var files         = this.props.files;
            var file          = files.getFile(index);
            var confirmDialog = this.refs.confirmDialog;
            confirmDialog.setState({
                visible:   true,
                icon:      'icon-triangle-warning',
                content:   'Are you sure you want to delete the directory "' + file.getName() + '"?',
                title:     'Delete directory',
                onConfirm: function() {
                    files.removeDir(
                        file.getName(),
                        function() {
                            state.activeFileIndex = 0;
                            file                  = files.getFile(0);
                            if (file) {
                                file.getData(function(data) {
                                    this.refs.codeMirror.setCode(data, file.getName());
                                    this.setState(state);
                                }.bind(this));
                            }
                        }.bind(this)
                    );
                }.bind(this)
            });
        },

        onRenameFile: function(index) {
            var state        = this.state;
            var files        = this.props.files;
            var file         = files.getFile(index);
            var name         = file.getName();
            var dirname;
            var filename;
            var promptDialog = this.refs.promptDialog;
            var i;

            i        = name.lastIndexOf('/');
            dirname  = name.substr(0, i + 1);
            filename = name.substr(i + 1 - name.length);

            promptDialog.show(
                'Rename file',
                'Rename "' + name + '" to:',
                'Enter filename...',
                filename,
                function(value) {
                    file.setName(dirname + value, this.updateFiles.bind(this));
                }.bind(this)
            );
        },

        onChange: function() {
            var file = this.getActiveFile();
            if (file && !file.getChanged()) {
                file.setChanged(true);
                this.updateFiles();
            }
        },

        onShowError: function(filename, lineNumber) {
            this.onSelectFile(filename);
            this.refs.codeMirror.highlightLine(lineNumber, 'line-error');
        },

        onShowLog: function(filename, lineNumber) {
            this.onSelectFile(filename);
            this.refs.codeMirror.highlightLine(lineNumber, 'line-log', true);
        },

        onCloseConsole: function() {
            this.refs.codeMirror.setConsole(false);
        },

        onShowConsole: function() {
            this.refs.console.show() && this.refs.codeMirror.setConsole(true);
        },

        onClearMessages: function() {
            var props    = this.props;
            var files    = props.files;
            var includes = props.compiler.getIncludes() || [];
            for (var i = 0; i < includes.length; i++) {
                var filename     = includes[i].filename,
                    index         = files.exists(filename);
                if (index !== false) {
                    var file = files.getFile(index);
                    file.getMeta().highlightLines = {};
                }
            }
            this.refs.codeMirror.setHighlight({});
        },

        onMouseMove: function(event) {
            if (this._resizeListener) {
                this._resizeListener.onResize(event.pageX, event.pageY);
                event.preventDefault();
            }
        },

        onMouseUp: function(event) {
            this._resizeListener && this._resizeListener.onEndResize();
            this._resizeListener = null;
        },

        onMouseOut: function(event) {
            this._resizeListener && this._resizeListener.onEndResize();
            this._resizeListener = null;
        },

        openFile: function(filename) {
            var state = this.state;
            var files = this.props.files;
            var file  = files.getFile(state.activeFileIndex);
            var index = files.exists(filename);

            if (index === false) {
                return;
            }
            file.setData(this.refs.codeMirror.getCode());

            state.activeFileIndex = index;
            this.setState(this.state);
            file = files.getFile(state.activeFileIndex);
            if (file) {
                file.getData(function(data) {
                    this.refs.codeMirror.setCode(data, file, getName());
                }.bind(this));
            }
        },

        render: function() {
            var files = this.props.files;
            var file  = files.getFile(this.state.activeFileIndex);
            var data  = '';

            if (file) {
                if (file.getHasData()) {
                    data = file.getData();
                } else {
                    file.getData(function(data) {
                        this.refs.codeMirror.setCode(data, file.getName());
                    }.bind(this));
                }
            }

            return utilsReact.fromJSON({
                props: {
                    id:          'main',
                    onMouseMove: this.onMouseMove,
                    onMouseUp:   this.onMouseUp
                },
                children: [
                    {
                        type: wheel.components.editor.MenuComponent,
                        props: {
                            activeProject: this.state.activeProject,
                            callbacks: {
                                onShowProject: this.onShowProject,
                                onNew:         this.onNew,
                                onSave:        this.onSave,
                                onSelectAll:   this.onSelectAll,
                                onFormatCode:  this.onFormatCode,
                                onFind:        this.onFind,
                                onFindNext:    this.onFindNext,
                                onFindPrev:    this.onFindPrev,
                                onUndo:        this.onUndo,
                                onRedo:        this.onRedo,
                                onMotors:      this.onMotors,
                                onSensors:     this.onSensors,
                                onExamples:    this.onExamples,
                                onRun:         this.onRun
                            }
                        }
                    },
                    {
                        type: wheel.components.editor.FilesComponent,
                        props: {
                            ref:             'files',
                            editor:          this,
                            activeFileIndex: this.state.activeFileIndex,
                            files:           files,
                            onSelectFile:    this.onSelectFile,
                            onDeleteFile:    this.onDeleteFile,
                            onDeleteDir:     this.onDeleteDir,
                            onRenameFile:    this.onRenameFile
                        }
                    },
                    {
                        type: wheel.components.editor.CodeMirrorComponent,
                        props: {
                            compiler:     this.props.compiler,
                            defaultValue: data,
                            ref:          'codeMirror',
                            onChange:     this.onChange
                        }
                    },
                    {
                        type: wheel.components.output.OutputComponent,
                        props: {
                            ref:            'output',
                            editor:         this,
                            onRun:          this.onRun,
                            onSmall:        this.onSmall,
                            onLarge:        this.onLarge,
                            onShowConsole:  this.onShowConsole,
                            motors:         this.props.motors
                        }
                    },
                    {
                        type:  wheel.components.output.ConsoleComponent,
                        props: {
                            ref:             'console',
                            onShowError:     this.onShowError,
                            onShowLog:       this.onShowLog,
                            onClearMessages: this.onClearMessages,
                            onClose:         this.onCloseConsole,
                            editor:          this
                        }
                    },
                    {
                        type: wheel.components.dialogs.AlertDialog,
                        props: {
                            ref: 'alertDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.ConfirmDialog,
                        props: {
                            ref: 'confirmDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.MotorsDialog,
                        props: {
                            editor: this,
                            ref:     'motorsDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.SensorsDialog,
                        props: {
                            editor: this,
                            ref:     'sensorsDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.ExamplesDialog,
                        props: {
                            ref: 'examplesDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.PromptDialog,
                        props: {
                            ref: 'promptDialog'
                        }
                    },
                    {
                        type: wheel.components.dialogs.NewDialog,
                        props: {
                            files: this.props.files,
                            ref:   'newDialog'
                        }
                    }
                ]
            });
        }
    })
);