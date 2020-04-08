/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher          = require('../../../../lib/dispatcher').dispatcher;
const Emitter             = require('../../../../lib/Emitter').Emitter;
const formEditorConstants = require('./formEditorConstants');
const ComponentBuilder    = require('./ComponentBuilder').ComponentBuilder;
const ComponentList       = require('./ComponentList').ComponentList;
const UndoStack           = require('./UndoStack').UndoStack;

let nextId = 0;

exports.FormEditorState = class extends Emitter {
    constructor(opts) {
        super(opts);
        this._clipboard          = null;
        this._getOwnerByParentId = opts.getOwnerByParentId;
        this._formId             = this.peekId();
        this._componentList      = new ComponentList({formEditorState: this});
        this._componentBuilder   = new ComponentBuilder({formEditorState: this, componentList: this._componentList});
        this._undoStack          = new UndoStack({formEditorState: this, componentList: this._componentList});
        this._component          = formEditorConstants.COMPONENT_TYPE_BUTTON;
        this._dispatch           = [
            dispatcher.on('Properties.Property.Change', this, this.onChangeProperty),
            dispatcher.on('Properties.Select',          this, this.onSelectProperties),
            dispatcher.on('Properties.SelectComponent', this, this.onSelectComponent)
        ];
        setTimeout(this.initForm.bind(this, opts), 50);
    }

    remove() {
        while (this._dispatch.length) {
            this._dispatch.pop()();
        }
    }

    initForm(opts) {
        let form      = opts.data ? opts.data[0] : null;
        let component = this._componentBuilder.addFormComponent({
            type:   'form',
            uid:    form ? form.uid    : this._componentList.getNewComponentUid(),
            name:   form ? form.name   : opts.filename,
            title:  form ? form.title  : opts.filename,
            width:  form ? form.width  : opts.width,
            height: form ? form.height : opts.height
        });
        component.id = this._formId;
        this._componentList.setComponentById(component, this._formId);
        this
            .emit('AddForm', Object.assign({}, component))
            .updateComponents(component.id)
            .onSelectComponent(component.id);
        if (opts.data) {
            let data = opts.data;
            let ids  = {};
            ids[1] = this._formId;
            for (let i = 1; i < data.length; i++) {
                let component = data[i];
                ids[component.id]  = nextId;
                component.parentId = ids[component.parentId];
                component.owner    = this._getOwnerByParentId(component.parentId);
                if ('containerId' in component) {
                    let containerId = component.containerId;
                    for (let j = 0; j < containerId.length; j++) {
                        ids[containerId[j]] = nextId + j + 2;
                        containerId[j]      = nextId + j + 2;
                    }
                }
                this.addComponent(component);
            }
        }
        this._undoStack.setEnabled(true);
    }

    peekId() {
        return nextId + 1;
    }

    getNextId() {
        nextId++;
        return nextId;
    }

    setComponent(component) {
        this._component = component;
    }

    getUndoStackLength() {
        return this._undoStack.getLength();
    }

    getFormComponent() {
        return this._componentList.getComponentById(this._formId);
    }

    setComponentPositionById(id, position) {
        let component = this._componentList.getComponentById(id) || {};
        this._undoStack.undoStackPush({
            action:   formEditorConstants.ACTION_CHANGE_POSITION,
            id:       id,
            position: {x: component.x, y: component.y}
        });
        component.x = position.x;
        component.y = position.y;
    }

    getComponentById(id) {
        return this._componentList.getComponentById(id);
    }

    getActiveComponentId() {
        return this._componentList.getActiveComponentId();
    }

    getActiveComponentParentId() {
        let activeComponent = this.getActiveComponent();
        if (activeComponent.type === formEditorConstants.COMPONENT_TYPE_TABS) {
            return activeComponent.containerId;
        }
        if (!activeComponent ||
            (activeComponent.type === formEditorConstants.COMPONENT_TYPE_FORM) ||
            (activeComponent.parentId === this._formId)) {
            return null;
        }
        return activeComponent.parentId;
    }

    getActiveComponent() {
        return this._componentList.getComponentById(this.getActiveComponentId()) || null;
    }

    getActiveComponentType() {
        let activeComponent = this.getActiveComponent();
        return activeComponent ? activeComponent.type : null;
    }

    getCanCopy() {
        switch (this.getActiveComponentType()) {
            case formEditorConstants.COMPONENT_TYPE_BUTTON:        return true;
            case formEditorConstants.COMPONENT_TYPE_SELECT_BUTTON: return true;
            case formEditorConstants.COMPONENT_TYPE_LABEL:         return true;
            case formEditorConstants.COMPONENT_TYPE_CHECKBOX:      return true;
        }
        return false;
    }

    getCanPaste() {
        return !!this._clipboard;
    }

    getHasUndo() {
        return this._undoStack.getLength();
    }

    getData() {
        return this._componentList.getData();
    }

    undo() {
        this._undoStack.undo();
    }

    addComponent(opts) {
        let component = {
                tabIndex: 0,
                id:       this.getNextId(),
                uid:      this._componentList.getNewComponentUid(),
                x:        opts.x,
                y:        opts.y,
                owner:    opts.owner,
                parentId: opts.parentId
            };
        this._componentList
            .setComponentById(component, component.id)
            .setActiveComponentId(component.id);
        this._componentBuilder.addComponentForType(component, opts.type || this._component);
        this._undoStack.undoStackPush({action: formEditorConstants.ACTION_ADD_COMPONENT, id: component.id});
        this
            .emit('AddComponent', Object.assign({}, component))
            .updateComponents(component.id);
    }

    deleteActiveComponent() {
        this._componentList.deleteActiveComponent();
    }

    deleteComponentById(id, saveUndo) {
        let component = this._componentList.deleteComponentById(id);
        if (saveUndo) {
            this._undoStack.undoStackPush({action: formEditorConstants.ACTION_DELETE_COMPONENT, component: component});
        }
        this.emit('DeleteComponent', id);
        dispatcher.dispatch('Properties.ComponentList', {value: null, items: this._componentList.getItems()});
    }

    copy() {
        if (!this.getCanCopy()) {
            return false;
        }
        let component = this.getActiveComponent();
        if (component) {
            this._clipboard = Object.assign({}, component);
            delete this._clipboard.owner;
            return true;
        }
        return false;
    }

    paste(parentId, owner) {
        let clipboard = this._clipboard;
        if (!clipboard) {
            return;
        }
        clipboard.owner    = owner;
        clipboard.parentId = parentId;
        clipboard.x += 32;
        clipboard.y += 32;
        this.addComponent(clipboard);
    }

    selectComponentById(id) {
        let component = this._componentList.selectComponentById(id);
        component && this.emit('SelectComponent', id);
        return component;
    }

    changeTabs(component, value) {
        this._componentList.changeTabs(component, value);
    }

    onChangeProperty(id, property, value) {
        let component = this._componentList.getComponentById(id);
        if (!component) {
            return;
        }
        if ((component.type === 'tabs') && (property === 'tabs')) {
            // Todo: add undo...
            this.changeTabs(component, value);
        } else {
            this._undoStack.undoStackPush({
                action:   formEditorConstants.ACTION_CHANGE_PROPERTY,
                id:       id,
                property: property,
                value:    component[property]
            });
        }
        component[property] = value;
        if (component.type) {
            this.emit('ChangeForm');
        }
    }

    onSelectProperties(properties) {
        this.selectComponentById(properties.id);
    }

    onSelectComponent(id) {
        let component = this.selectComponentById(id);
        if (component) {
            let properties = [].concat(formEditorConstants.PROPERTIES_BY_TYPE[component.type.toUpperCase()]);
            let events     = [].concat(formEditorConstants.EVENTS_BY_TYPE[component.type.toUpperCase()]);
            properties.uid = component.uid;
            properties.id  = id;
            events.id      = id;
            dispatcher.dispatch('Properties.Select', properties, events, this);
        }
        return this;
    }

    updateComponents(id) {
        dispatcher.dispatch('Properties.ComponentList', {value: id, items: this._componentList.getItems()});
        return this;
    }
};
