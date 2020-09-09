/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../dispatcher').dispatcher;
const DOMNode    = require('../dom').DOMNode;
const Component  = require('./Component').Component;

const ListItem = class extends DOMNode {
        constructor(opts) {
            super(opts);
            this._title    = opts.title;
            this._value    = opts.value;
            this._dropdown = opts.dropdown;
            this._dropdown.addItem(this);
            this.initDOM(opts.parentNode);
        }

        initDOM(parentNode) {
            this.create(
                parentNode,
                {
                    id:        this.setElement.bind(this),
                    className: 'dropdown-list-item',
                    innerHTML: this._title
                }
            );
        }

        setSelected(selected) {
            this._element.className = 'dropdown-list-item' + (selected ? ' selected' : '');
        }

        setElement(element) {
            element.addEventListener('mousedown', this.onMouseDown.bind(this));
            this._element = element;
        }

        onMouseDown(event) {
            this.onCancelEvent(event);
            this._dropdown
                .setValueAndChange(this._value)
                .dispatchValue();
            setTimeout(this._dropdown.close.bind(this._dropdown), 500);
        }
    };

exports.Dropdown = class extends Component {
    constructor(opts) {
        opts.baseClassName = 'dropdown';
        super(opts);
        this._items        = this.getUpdatedItems(opts.items);
        this._value        = null;
        this._itemElements = [];
        this._tabIndex     = opts.tabIndex;
        this._onChange     = opts.onChange;
        this.initDOM(opts.parentNode);
    }

    initListItems() {
        let children = [];
        this._items.forEach(
            function(item) {
                children.push({
                    dropdown: this,
                    type:     ListItem,
                    title:    item.title,
                    value:    item.value
                });
            },
            this
        );
        return children;
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                id:        this.setElement.bind(this),
                ref:       this.setRef('dropdown'),
                className: this.getClassName(),
                style:     this._style,
                children: [
                    {
                        id:        this.setValueElement.bind(this),
                        type:      'a',
                        href:      '#',
                        className: 'dropdown-value',
                        innerHTML: '',
                        tabIndex:  this._tabIndex
                    },
                    {
                        ref:       this.setRef('list'),
                        className: 'dropdown-list',
                        children:  this.initListItems()
                    }
                ]
            }
        );
        if (this._items.length) {
            this.setValue(this._items[0].value);
            this.updateHeight();
        }
    }

    addItem(item) {
        this._itemElements.push(item);
    }

    getUpdatedItems(items) {
        let result = [];
        (items || []).forEach((item, index) => {
            if (typeof item === 'string') {
                result.push({title: item, value: index});
            } else {
                result.push(item);
            }
        });
        return result;
    }

    setValueElement(element) {
        this._valueElement = element;
        if (this._design) {
            return;
        }
        element.addEventListener('focus',     this.onValueFocus.bind(this));
        element.addEventListener('blur',      this.onValueBlur.bind(this));
        element.addEventListener('mousedown', this.onValueMouseDown.bind(this));
        element.addEventListener('mouseup',   this.onValueMouseUp.bind(this));
        element.addEventListener('click',     this.onValueClick.bind(this));
        element.addEventListener('keyup',     this.onValueKeyUp.bind(this));
    }

    getValue() {
        return this._value;
    }

    setValue(value) {
        let title = '';
        let found = false;
        this._items.forEach(
            function(item, index) {
                let active = (item.value === value);
                this._itemElements[index].setSelected(active);
                if (active) {
                    this._value = item.value;
                    title       = item.title;
                    found       = true;
                }
            },
            this
        );
        if (!found) {
            this._value = null;
        }
        this._valueElement.innerHTML = title;
        return this;
    }

    setValueAndChange(value) {
        this.setValue(value);
        if (typeof this._onChange === 'function') {
            this._onChange(value);
        }
        return this;
    }

    setItems(items) {
        this._itemElements = [];
        this._items        = this.getUpdatedItems(items);
        let refs = this._refs;
        let list = refs.list;
        while (list.childNodes.length) {
            list.removeChild(list.childNodes[0]);
        }
        let children = this.initListItems();
        children.forEach(
            function(item) {
                this.create(refs.list, item);
            },
            this
        );
        if (items.length) {
            this.setValue(this._value);
            if (!this._value) {
                this.setValue(items[0].value);
            }
            this.updateHeight();
        } else {
            this._valueElement.innerHTML = '';
            this._value                  = null;
        }
        return this;
    }

    updateHeight() {
        let list  = this._refs.list;
        let items = this._items;
        if (items.length >= 9) {
            list.style.height = '208px';
        } else {
            list.style.height = (items.length * 24 + 2) + 'px';
        }
    }

    focus() {
        this._valueElement.focus();
        return this;
    }

    close() {
        this._refs.dropdown.className = 'dropdown';
    }

    onValueFocus(event) {
        this.onCancelEvent(event);
        if (this._items.length) {
            this._refs.dropdown.className = 'dropdown focus';
        }
    }

    onEvent(opts) {
        if ('items' in opts) {
            this.setItems(opts.items);
        }
        if ('value' in opts) {
            this.setValue(opts.value);
        }
        super.onEvent(opts);
    }

    onValueBlur(event) {
        this.onCancelEvent(event);
        this._refs.dropdown.className = 'dropdown';
    }

    onValueMouseDown(event) {
        this.onCancelEvent(event);
    }

    onValueMouseUp(event) {
        this.onCancelEvent(event);
    }

    onValueClick(event) {
        this.onCancelEvent(event);
        this._valueElement.focus();
        if (this._items.length) {
            this._refs.dropdown.className = 'dropdown focus';
        }
    }

    onValueKeyUp(event) {
        if (this._design) {
            return;
        }
        if (!this._items.length) {
            return;
        }
        let value        = null;
        let refs         = this._refs;
        let items        = this._items;
        let itemElements = this._itemElements;
        switch (event.keyCode) {
            case 13: // Enter
                this.close();
                break;
            case 38: // Up
                for (let i = 1; i < items.length; i++) {
                    let item = items[i];
                    if (item.value === this._value) {
                        value = items[i - 1].value;
                        break;
                    }
                }
                if (value) {
                    this
                        .setValueAndChange(value)
                        .dispatchValue();
                } else {
                    this
                        .setValueAndChange(items[0].value)
                        .dispatchValue();
                }
                refs.dropdown.className = 'dropdown focus';
                break;
            case 40: // Down
                for (let i = 0; i < items.length - 1; i++) {
                    let item = items[i];
                    if (item.value === this._value) {
                        value = items[i + 1].value;
                        break;
                    }
                }
                if (value) {
                    this
                        .setValueAndChange(value)
                        .dispatchValue();
                }
                refs.dropdown.className = 'dropdown focus';
                break;
        }
    }

    dispatchValue() {
        if (this._dispatch) {
            dispatcher.dispatch(this._dispatch, this._value);
        }
    }
};

exports.Component = exports.Dropdown;
