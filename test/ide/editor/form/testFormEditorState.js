/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher          = require('../../../../js/frontend/lib/dispatcher').dispatcher;
const ContainerIdsForForm = require('../../../../js/frontend/ide/editor/editors/form/ContainerIdsForForm').ContainerIdsForForm;
const FormEditorState     = require('../../../../js/frontend/ide/editor/editors/form/state/FormEditorState').FormEditorState;
const formEditorConstants = require('../../../../js/frontend/ide/editor/editors/form/formEditorConstants');
const assert              = require('assert');

afterEach(() => {
    dispatcher.reset();
});

const EMPTY_FORM = [
            {
                type:   'form',
                name:   'label',
                id:     1,
                uid:    0x843532C2,
                title:  'Label example',
                width:  280,
                height: 70
            }
        ];

const FORM_WITH_ONE_COMPONENT = [
        {
            type:     'form',
            name:     'label',
            id:       1,
            uid:      0x843532C2,
            title:    'Label example',
            width:    280,
            height:   70
        },
        {
            type:     'label',
            name:     'Label',
            parentId: 1,
            id:       2,
            uid:      0x3B44B2E3,
            x:        40,
            y:        20,
            tabIndex: 0,
            hidden:   false,
            disabled: false,
            text:     'Count:',
            halign:   'left'
        }
    ];

const FORM_WITH_TWO_COMPONENTS = [
        {
            type:     'form',
            id:       1,
            uid:      0x843532C2,
            name:     'label',
            title:    'Label example',
            width:    280,
            height:   70
        },
        {
            type:     'label',
            name:     'Label1',
            parentId: 1,
            id:       2,
            uid:      0x3B44B2E3,
            x:        40,
            y:        20,
            tabIndex: 0,
            hidden:   false,
            disabled: false,
            text:     'Count:'
        },
        {
            id:       3,
            uid:      0x5EF685C3,
            parentId: 1,
            x:        110,
            y:        20,
            tabIndex: 0,
            hidden:   false,
            disabled: false,
            type:     'label',
            name:     'Count',
            text:     0
        }
    ];

const getFormEditorState0 = () => {
        return new FormEditorState({
            containerIdsForForm: new ContainerIdsForForm(),
            initTime:            2,
            path:                'hello/world',
            filename:            'test.wfrm',
            data:                EMPTY_FORM,
            settings:            {getFormGridSize() { return 10; }}
        });
    };

const getFormEditorState1 = () => {
        return new FormEditorState({
            containerIdsForForm: new ContainerIdsForForm(),
            initTime:            2,
            path:                'hello/world',
            filename:            'test.wfrm',
            data:                FORM_WITH_ONE_COMPONENT,
            settings:            {getFormGridSize() { return 10; }}
        });
    };

const getFormEditorState2 = () => {
        return new FormEditorState({
            containerIdsForForm: new ContainerIdsForForm(),
            initTime:            2,
            path:                'hello/world',
            filename:            'test.wfrm',
            data:                FORM_WITH_TWO_COMPONENTS,
            settings:            {getFormGridSize() { return 10; }}
        });
    };

describe(
    'Test FormEditorState',
    () => {
        describe(
            'Test constructor',
            () => {
                it(
                    'Should create FormEditorState instance',
                    () => {
                        let formEditorState = new FormEditorState({
                                containerIdsForForm: new ContainerIdsForForm(),
                                path:                'hello/world',
                                filename:            'test.wfrm'
                            });
                        assert.equal(formEditorState instanceof FormEditorState, true);
                    }
                );
                it(
                    'Should peek initial Id',
                    function(done) {
                        let formEditorState = new FormEditorState({
                                containerIdsForForm: new ContainerIdsForForm(),
                                initTime:            2,
                                path:                'hello/world',
                                filename:            'test.wfrm'
                            });
                        formEditorState.on(
                            'AddForm',
                            this,
                            () => {
                                assert.equal(formEditorState.peekId(), 1);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
            }
        );
        describe(
            'Test loading',
            () => {
                it(
                    'Should load an empty form',
                    function(done) {
                        let formEditorState = getFormEditorState0();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.peekId(),      2);
                                assert.equal(formEditorState.getFormName(), 'label');
                                let data = formEditorState.getData();
                                assert.equal(data[0].id, 1);
                                assert.equal(formEditorState.getFormComponent().name, 'label');
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(),      1);
                        assert.equal(formEditorState.getLoading(),  true);
                        assert.equal(formEditorState.getPath(),     'hello/world');
                        assert.equal(formEditorState.getFilename(), 'test.wfrm');
                    }
                );
                it(
                    'Should load a form with one component',
                    function(done) {
                        let formEditorState = getFormEditorState1();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.peekId(), 3);
                                let data = formEditorState.getData();
                                assert.equal(data[0].id,       1);
                                assert.equal(data[1].parentId, 1);
                                assert.equal(data[1].id,       2);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
                it(
                    'Should load a form with two components',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.peekId(), 4);
                                let data = formEditorState.getData();
                                assert.equal(data[0].id,       1);
                                assert.equal(data[1].parentId, 1);
                                assert.equal(data[1].id,       2);
                                assert.equal(data[2].parentId, 1);
                                assert.equal(data[2].id,       3);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
            }
        );
        it(
            'Should get a component by id',
            function(done) {
                let formEditorState = getFormEditorState1();
                formEditorState.on(
                    'Loaded',
                    this,
                    () => {
                        let component = formEditorState.getComponentById(1);
                        assert.equal(component.type,     'form');
                        component = formEditorState.getComponentById(2);
                        assert.equal(component.id,       2);
                        assert.equal(component.parentId, 1);
                        assert.equal(formEditorState.getComponentById(3), undefined);
                        done();
                    }
                );
                assert.equal(formEditorState.peekId(), 1);
            }
        );
        it(
            'Should get a component texts',
            function(done) {
                let formEditorState = getFormEditorState2();
                formEditorState.on(
                    'Loaded',
                    this,
                    () => {
                        // There's a label caller "Label1"...
                        assert.equal(formEditorState.getComponentList().findComponentText('label', 'name', 'Label'), 'Label2');
                        // There's no input yet...
                        assert.equal(formEditorState.getComponentList().findComponentText('input', 'name', 'Input'), 'Input1');
                        done();
                    }
                );
                assert.equal(formEditorState.peekId(), 1);
            }
        );
        describe(
            'Test deleting',
            () => {
                it(
                    'Should delete a component',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length, 3);
                                formEditorState.deleteComponentById(2, false);
                                let data = formEditorState.getData();
                                assert.equal(data.length, 2);
                                assert.equal(data[0].id,  1);
                                assert.equal(data[1].id,  3);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
                it(
                    'Should delete a component, get renumbered ids',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length, 3);
                                formEditorState.deleteComponentById(2, false);
                                let data = formEditorState.getData(true);
                                assert.equal(data.length, 2);
                                assert.equal(data[0].id,  1);
                                assert.equal(data[1].id,  2); // <-- This one!!!
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
                it(
                    'Should delete a component, save undo',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length,     3);
                                assert.equal(formEditorState.getUndoStackLength(), 0);
                                formEditorState.deleteComponentById(2, true);
                                assert.equal(formEditorState.getUndoStackLength(), 1);
                                let data = formEditorState.getData(true);
                                assert.equal(data.length, 2);
                                assert.equal(data[0].id,  1);
                                assert.equal(data[1].id,  2); // <-- This one!!!
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
                it(
                    'Should delete a component, apply undo',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length,     3);
                                assert.equal(formEditorState.getUndoStackLength(), 0);
                                let component0 = formEditorState.getComponentById(2);
                                formEditorState.deleteComponentById(2, true);
                                assert.equal(formEditorState.getUndoStackLength(), 1);
                                formEditorState.undo();
                                let component1 = formEditorState.getComponentById(2);
                                for (let i in component0) {
                                    // The parentId is based on the owner which is the DOM node, ignore it here:
                                    if ((typeof component0[i] !== 'object') && (i !== 'parentId')) {
                                        assert.equal(component0[i], component1[i]);
                                    }
                                }
                                assert.equal(formEditorState.getUndoStackLength(), 0);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
            }
        );
        describe(
            'Test adding',
            () => {
                it(
                    'Should add a component',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length, 3);
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                assert.equal(formEditorState.getData().length, 4);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
                it(
                    'Should add a component and undo',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                assert.equal(formEditorState.getData().length, 3);
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                let data = formEditorState.getData();
                                assert.equal(data[0].id,  1);
                                assert.equal(data[1].id,  2);
                                assert.equal(data[2].id,  3);
                                assert.equal(data[3].id,  4);
                                assert.equal(data.length, 4);
                                formEditorState.undo();
                                data = formEditorState.getData();
                                assert.equal(data.length, 3);
                                assert.equal(data[0].id,  1);
                                assert.equal(data[1].id,  2);
                                assert.equal(data[2].id,  3);
                                done();
                            }
                        );
                        assert.equal(formEditorState.peekId(), 1);
                    }
                );
            }
        );
        describe(
            'Test setting a position',
            () => {
                it(
                    'Should set component position',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                formEditorState.setComponentPositionById(newId, {x: 10, y: 20});
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                delete component.uid;
                                assert.deepEqual(
                                    component,
                                    {
                                        type:       'label',
                                        id:         4,
                                        tabIndex:   0,
                                        hidden:     false,
                                        disabled:   false,
                                        name:       'Label2',
                                        zIndex:     0,
                                        text:       'Label2',
                                        halign:     'left',
                                        x:          10,
                                        y:          20
                                    }
                                );
                                done();
                            }
                        );
                    }
                );
                it(
                    'Should set component position, align to grid',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                formEditorState.setComponentPositionById(newId, {x: 15, y: 25});
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                delete component.uid;
                                assert.deepEqual(
                                    component,
                                    {
                                        type:       'label',
                                        id:         4,
                                        tabIndex:   0,
                                        hidden:     false,
                                        disabled:   false,
                                        name:       'Label2',
                                        zIndex:     0,
                                        text:       'Label2',
                                        halign:     'left',
                                        x:          20,
                                        y:          30
                                    }
                                );
                                done();
                            }
                        );
                    }
                );
            }
        );
        describe(
            'Test changing a property',
            () => {
                it(
                    'Should change zIndex',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                formEditorState.setComponentPositionById(newId, {x: 10, y: 20});
                                dispatcher.dispatch('Properties.Property.Change', newId, 'zIndex', 123);
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.zIndex, 123);
                                done();
                            }
                        );
                    }
                );
                it(
                    'Should change zIndex and undo',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                // Set position to add an extra item on the undo stack...
                                formEditorState.setComponentPositionById(newId, {x: 10, y: 20});
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.zIndex, 0);
                                dispatcher.dispatch('Properties.Property.Change', newId, 'zIndex', 123);
                                component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.zIndex, 123);
                                formEditorState.undo();
                                component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.zIndex, 0);
                                done();
                            }
                        );
                    }
                );
                it(
                    'Should change component name',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                formEditorState.setComponentPositionById(newId, {x: 10, y: 20});
                                dispatcher.dispatch('Properties.Property.Change', newId, 'name', 'newName');
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.name, 'newName');
                                done();
                            }
                        );
                    }
                );
            }
        );
        describe(
            'Test changing an event',
            () => {
                it(
                    'Should change event',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                dispatcher.dispatch('Properties.Event.Change', newId, 'onClick', 'onClickEvent');
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.onClick, 'onClickEvent');
                                done();
                            }
                        );
                    }
                );
                it(
                    'Should remote event',
                    function(done) {
                        let formEditorState = getFormEditorState2();
                        formEditorState.on(
                            'Loaded',
                            this,
                            () => {
                                let newId = formEditorState.peekId();
                                formEditorState.addComponent({
                                    type: formEditorConstants.COMPONENT_TYPE_LABEL
                                });
                                dispatcher.dispatch('Properties.Event.Change', newId, 'onClick', 'onClickEvent');
                                let component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal(component.onClick, 'onClickEvent');
                                dispatcher.dispatch('Properties.Event.Change', newId, 'onClick', false);
                                component = formEditorState.getComponentList().getComponentClone(newId);
                                assert.equal('onClick' in component, false);
                                done();
                            }
                        );
                    }
                );
            }
        );
    }
);
