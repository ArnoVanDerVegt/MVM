/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const path                = require('../../../../../shared/lib/path');
const dispatcher          = require('../../../../lib/dispatcher').dispatcher;
const DOMNode             = require('../../../../lib/dom').DOMNode;
const getImage            = require('../../../data/images').getImage;
const FormEditorState     = require('./state/FormEditorState');
const EventList           = require('./state/EventList').EventList;
const PropertyList        = require('./state/PropertyList').PropertyList;
const formEditorConstants = require('./formEditorConstants');

exports.FormComponentContainer = class extends DOMNode {
    constructor(opts) {
        super(opts);
        if (!opts.containerId) {
            throw new Error('Missing container id');
        }
        this._containerIdsForForm = opts.containerIdsForForm;
        this._containerId         = opts.containerId;
        this._settings            = opts.settings;
        this._design              = opts.design;
        this._getDataProvider     = opts.getDataProvider;
        this._mouseDown           = false;
        this._mouseOffsetX        = 0;
        this._mouseOffsetY        = 0;
        this._mouseElement        = null;
        this._mouseComponentId    = null;
        this._mouseMoved          = false;
        this._elementById         = {};
        this._onMouseDown         = opts.onMouseDown;
        this._ui                  = opts.ui;
        this._className           = opts.className;
        this._formEditorState     = opts.formEditorState;
        this._events              = [
            this._formEditorState.on('AddComponent',    this, this.onAddComponent),
            this._formEditorState.on('DeleteComponent', this, this.onDeleteComponent),
            this._formEditorState.on('ChangePosition',  this, this.onChangePosition),
            this._formEditorState.on('ChangeProperty',  this, this.onChangeProperty),
            dispatcher.on('Properties.Property.Change', this, this.onChangeProperty)
        ];
        this._containerIdsForForm.addContainerId(this._containerId, this);
        this.initDOM(opts.parentNode);
        opts.id && opts.id(this);
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                id:        this.setFormElement.bind(this),
                className: this._className + ' parent'
            }
        );
    }

    remove() {
        let events = this._events;
        while (events.length) {
            events.pop()();
        }
        this._formElement.parentNode.removeChild(this._formElement);
        // - Remove garbage in the range of the form ids:
        // - let maxId = ~~(this._parentId / 10240) * 10240 + 10240;
        // - for (let id in formComponentContainerByParentId) {
        // -     if ((id >= this._parentId) && (id < maxId)) {
        // -         delete formComponentContainerByParentId[id];
        // -     }
        // - }
    }

    getFormElement() {
        return this._formElement;
    }

    setClassName(className) {
        this._formElement.className = className;
    }

    setFormElement(element) {
        this._formElement = element;
        element.addEventListener('click',     this.onClick.bind(this));
        element.addEventListener('mousedown', this.onMouseDown.bind(this));
        element.addEventListener('mousemove', this.onMouseMove.bind(this));
        element.addEventListener('mouseup',   this.onMouseUp.bind(this));
        element.addEventListener('mouseout',  this.onMouseOut.bind(this));
    }

    setClassName(className) {
        this._formElement.className = className + ' parent';
    }

    getContainerId() {
        return this._containerId;
    }

    getElementById(id) {
        return this._elementById[id];
    }

    getFormPath() {
        let documentPath = this._settings.getDocumentPath();
        let formPath     = path.removePath(documentPath, this._formEditorState.getPath());
        return path.join(documentPath, formPath);
    }

    resetMouseElement() {
        if (this._mouseElement) {
            this._mouseElement.onEvent({pointerEvents: 'auto'});
            this._mouseElement = null;
        }
    }

    onMouseDown(event) {
        this.onCancelEvent(event);
        this._mouseDown  = true;
        this._mouseMoved = false;
    }

    onMouseMove(event) {
        this._mouseMoved = true;
        this.onCancelEvent(event);
        if (!this._mouseDown || !this._mouseElement) {
            return;
        }
        let x        = event.offsetX - this._mouseOffsetX;
        let y        = event.offsetY - this._mouseOffsetY;
        let position = {x: x, y: y};
        this._formEditorState.setComponentPositionById(this._mouseComponentId, position);
        this._mouseElement.onEvent(position);
        dispatcher.dispatch('Properties.ChangePosition', position);
    }

    onMouseUp(event) {
        this.onCancelEvent(event);
        this.resetMouseElement();
        this._mouseDown = false;
    }

    onMouseOut(event) {
        this.onCancelEvent(event);
        this.resetMouseElement();
        this._mouseDown = false;
    }

    onClick(event) {
        let className = event.target.className + '';
        if (className.indexOf('parent') === -1) {
            return;
        }
        this.onCancelEvent(event);
        if (this._mouseElement) {
            this.resetMouseElement();
        } else if (!this._mouseMoved) {
            this._formEditorState.addComponent({
                x:        event.offsetX,
                y:        event.offsetY,
                owner:    this,
                parentId: this._containerId
            });
        }
    }

    onChangeProperty(id, property, value) {
        let element = this._elementById[id];
        if (!element) {
            return;
        }
        let opts = {};
        opts[property] = value;
        element.onEvent(opts);
    }

    onChangePosition(id, position) {
        let element = this._elementById[id];
        if (!element) {
            return;
        }
        element.onEvent(position);
    }

    onComponentMouseDown(event, element, opts) {
        let offsetX    = event.offsetX;
        let offsetY    = event.offsetY;
        let parentNode = event.target;
        while (parentNode.parentNode.className.indexOf('parent') === -1) {
            offsetX += parentNode.offsetLeft;
            offsetY += parentNode.offsetTop;
            parentNode = parentNode.parentNode;
        }
        if (!this._formEditorState.getComponentById(opts.id)) {
            return;
        }
        element.onEvent({pointerEvents: 'none'});
        this._mouseDown        = true;
        this._mouseComponentId = opts.id;
        this._mouseOffsetX     = offsetX;
        this._mouseOffsetY     = offsetY;
        this._mouseElement     = element;
        event.stopPropagation();
        dispatcher
            .dispatch('Properties.Select.Properties', opts.propertyList, this._formEditorState)
            .dispatch('Properties.Select.Events',     opts.eventList,    this._formEditorState)
            .dispatch('Properties.ComponentList',     {value: opts.id});
    }

    onAddComponent(opts) {
        let propertiesByType = formEditorConstants.PROPERTIES_BY_TYPE;
        opts.containerIdsForForm  = this._containerIdsForForm;
        opts.componentConstructor = require('../../../../' + propertiesByType[opts.type.toUpperCase()].component).Component;
        if (!opts.componentConstructor) {
            return;
        }
        switch (opts.type) {
            case formEditorConstants.COMPONENT_TYPE_PANEL:
                opts.panelConstructor = exports.FormComponentContainer;
                opts.panelOpts        = {
                    formEditorState: this._formEditorState,
                    ui:              this._ui,
                    containerIds:    opts.containerIds
                };
                break;
            case formEditorConstants.COMPONENT_TYPE_TABS:
                opts.panelConstructor = exports.FormComponentContainer;
                opts.panelOpts        = {
                    formEditorState: this._formEditorState,
                    ui:              this._ui,
                    containerIds:    opts.containerIds
                };
                break;
        }
        this.addElement(opts);
    }

    onDeleteComponent(opts) {
        let elementById = this._elementById;
        if (!elementById[opts.id]) {
            return;
        }
        elementById[opts.id].remove();
        delete elementById[opts.id];
    }

    addElement(opts) {
        if (opts.owner !== this) {
            return;
        }
        let element;
        let formEditorState = this._formEditorState;
        let component       = formEditorState.propertiesFromComponentToOpts(opts.id, opts.propertyList, opts);
        opts.onMouseDown         = (event) => { this.onComponentMouseDown(event, element, opts); };
        opts.position            = 'absolute';
        opts.left                = opts.x;
        opts.top                 = opts.y;
        opts.getImage            = getImage;
        opts.getFormPath         = this.getFormPath.bind(this);
        opts.getDataProvider     = this._getDataProvider;
        opts.settings            = this._settings;
        opts.design              = this._design;
        opts.parentNode          = this._formElement;
        opts.containerIdsForForm = this._containerIdsForForm;
        opts.ui                  = this._ui;
        opts.uiId                = 1;
        opts.propertyList        = new PropertyList({
            component:       component,
            componentList:   formEditorState.getComponentList(),
            formEditorState: formEditorState
        });
        opts.eventList           = new EventList({
            component:       component,
            formEditorState: formEditorState
        });
        if (opts.panelOpts) {
            opts.panelOpts.onMouseDown = (event) => {
                this.onComponentMouseDown(event, element, opts);
            };
        }
        element                    = new opts.componentConstructor(opts);
        this._elementById[opts.id] = element;
        dispatcher
            .dispatch('Properties.Select.Properties', opts.propertyList, formEditorState)
            .dispatch('Properties.Select.Events',     opts.eventList,    formEditorState);
    }
};
