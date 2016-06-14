(function() {
    function init() {
        var registers = [
                {name: 'REG_OFFSET_STACK',      type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_OFFSET_SRC',        type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_OFFSET_DEST',       type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_E',                 type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_NE',                type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_L',                 type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_LE',                type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_G',                 type: wheel.compiler.command.T_NUMBER_REGISTER},
                {name: 'REG_GE',                type: wheel.compiler.command.T_NUMBER_REGISTER}
            ];
        var compiler    = new wheel.compiler.Compiler({registers: registers});
        var motors      = new wheel.vm.Motors({});
        var sensors     = new wheel.vm.Sensors({});
        var vm          = new wheel.vm.VM({registers: registers, motors: motors, sensors: sensors});
        var files       = new wheel.Files({});

        ReactDOM.render(
            utilsReact.fromJSON({
                props: {
                    className: 'container-events'
                },
                children: [
                    {
                        type: wheel.components.editor.EditorComponent,
                        props: {
                            compiler: compiler,
                            vm:       vm,
                            files:    files,
                            motors:   motors,
                            sensors:  sensors
                        }
                    }
                ]
            }),
            document.getElementById('container')
        );
    }

    window.addEventListener(
        'load',
        function() {
            init();
        }
    );
})();