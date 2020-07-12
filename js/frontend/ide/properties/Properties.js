/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher        = require('../../lib/dispatcher').dispatcher;
const Tabs              = require('../../lib/components/Tabs').Tabs;
const DOMNode           = require('../../lib/dom').DOMNode;
const tabIndex          = require('../tabIndex');
const PropertiesToolbar = require('./PropertiesToolbar').PropertiesToolbar;
const BooleanProperty   = require('./types/BooleanProperty').BooleanProperty;
const DropdownProperty  = require('./types/DropdownProperty').DropdownProperty;
const TextProperty      = require('./types/TextProperty').TextProperty;
const TextListProperty  = require('./types/TextListProperty').TextListProperty;
const HAlignProperty    = require('./types/HAlignProperty').HAlignProperty;
const ColorProperty     = require('./types/ColorProperty').ColorProperty;
const RgbProperty       = require('./types/RgbProperty').RgbProperty;
const Event             = require('./Event').Event;

exports.Properties = class extends DOMNode {
    constructor(opts) {
        super(opts);
        this._opts           = opts;
        this._ui             = opts.ui;
        this._settings       = opts.settings;
        this._value          = opts.value;
        this._properties     = [];
        this._propertyByName = {};
        this._events         = [];
        this._eventByName    = {};
        this.initDOM(opts.parentNode || document.body);
        dispatcher
            .on('Properties.Select.Properties', this, this.onSelectProperties)
            .on('Properties.Select.Events',     this, this.onSelectEvents)
            .on('Properties.ChangePosition',    this, this.onChangePosition)
            .on('Properties.ComponentList',     this, this.onChangeComponentList);
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                ref:       this.setRef('property'),
                className: 'properties',
                children: [
                    {
                        type:      PropertiesToolbar,
                        ui:        this._ui,
                        ev3:       this._ev3,
                        settings:  this._settings,
                        simulator: this
                    },
                    {
                        type: Tabs,
                        ui:   this._ui,
                        uiId: 1,
                        tabs: [
                            {
                                title:   'Properties',
                                onClick: this.onClickProperties.bind(this)
                            },
                            {
                                title:   'Events',
                                onClick: this.onClickEvents.bind(this)
                            }
                        ]
                    },
                    {
                        ref:       this.setRef('componentUid'),
                        className: 'component-uid',
                        innerHTML: '0x00000000'
                    },
                    {
                        ref:       this.setRef('propertiesContainer'),
                        className: 'properties-container visible',
                        children:  [
                            {
                                className: 'property-separator'
                            }
                        ]
                    },
                    {
                        ref:       this.setRef('eventsContainer'),
                        className: 'events-container',
                        children:  [
                            {
                                className: 'event-separator'
                            }
                        ]
                    }
                ]
            }
        );
        dispatcher.dispatch('Settings.UpdateViewSettings');
    }

    focusProperty(property) {
        this._properties.forEach((p) => {
            if ((p !== property) && p.setFocus) {
                p.setFocus(false);
            }
        });
    }

    focusEvent(event) {
        this._events.forEach((e) => {
            if ((e !== event) && e.setFocus) {
                e.setFocus(false);
            }
        });
    }

    clear(container) {
        let childNodes = container.childNodes;
        while (childNodes.length > 1) {
            let childNode = childNodes[childNodes.length - 1];
            childNode.parentNode.removeChild(childNode);
        }
        return this;
    }

    addProperty(property) {
        this._properties.push(property);
    }

    addEvent(event) {
        this._events.push(event);
    }

    onClickProperties() {
        let refs = this._refs;
        refs.propertiesContainer.style.display = 'block';
        refs.eventsContainer.style.display     = 'none';
    }

    onClickEvents() {
        let refs = this._refs;
        refs.propertiesContainer.style.display = 'none';
        refs.eventsContainer.style.display     = 'block';
    }

    onSelectProperties(propertyList, formEditorState) {
        this._refs.componentUid.innerHTML = propertyList.getComponentUid() || '0x00000000';
        this._properties.length           = 0;
        let propertiesContainer = this._refs.propertiesContainer;
        let id                  = propertyList.getComponentId();
        let propertyByName      = {};
        let component           = formEditorState.getComponentById(id);
        this.clear(propertiesContainer);
        propertyList.getList().forEach(
            function(property) {
                if (!property || (property.name === null)) {
                    return;
                }
                let propertyConstructor = null;
                let opts                = {
                        parentNode:    propertiesContainer,
                        properties:    this,
                        ui:            this._ui,
                        name:          property.name,
                        options:       property.options,
                        value:         propertyList.getProperty(property.name),
                        componentList: propertyList.getComponentList(),
                        component:     component,
                        onChange:      function(value) {
                            dispatcher.dispatch('Properties.Property.Change', id, property.name, value);
                        }
                    };
                switch (property.type) {
                    case 'boolean':  propertyConstructor = BooleanProperty;  break;
                    case 'text':     propertyConstructor = TextProperty;     break;
                    case 'textList': propertyConstructor = TextListProperty; break;
                    case 'halign':   propertyConstructor = HAlignProperty;   break;
                    case 'color':    propertyConstructor = ColorProperty;    break;
                    case 'rgb':      propertyConstructor = RgbProperty;      break;
                    case 'dropdown': propertyConstructor = DropdownProperty; break;
                }
                if (propertyConstructor) {
                    propertyByName[property.name] = new propertyConstructor(opts);
                }
            },
            this
        );
        this._propertyByName = propertyByName;
    }

    onSelectEvents(eventList, formEditorState) {
        this._refs.componentUid.innerHTML = eventList.getComponentUid() || '0x00000000';
        this._events.length               = 0;
        let eventsContainer = this._refs.eventsContainer;
        let id              = eventList.getComponentId();
        let eventByName     = {};
        let component       = formEditorState.getComponentById(id);
        this.clear(eventsContainer);
        eventList.getList().forEach(
            function(event) {
                if (!event) {
                    console.warn('Warning invalid event:', event, 'eventList:', eventList);
                    return;
                }
                eventByName[event.name] = new Event({
                    eventList:     eventList,
                    parentNode:    eventsContainer,
                    properties:    this,
                    ui:            this._ui,
                    name:          event.name,
                    value:         component[event.name] || '',
                    onChange: function(value) {
                        console.log('Change event:', id, event.name, value);
                        dispatcher.dispatch('Properties.Event.Change', id, event.name, value);
                    }
                });
            },
            this
        );
        this._eventByName = eventByName;
    }

    onChangePosition(position) {
        if (this._propertyByName.x) {
            this._propertyByName.x.setValue(position.x);
        }
        if (this._propertyByName.y) {
            this._propertyByName.y.setValue(position.y);
        }
    }

    onChangeComponentList(opts) {
        if (opts.value === null) {
            let refs = this._refs;
            this
                .clear(refs.propertiesContainer)
                .clear(refs.eventsContainer);
        }
    }
};
