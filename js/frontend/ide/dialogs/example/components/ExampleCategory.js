/**
 * Wheel, copyright (c) 2021 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const DOMNode  = require('../../../../lib/dom').DOMNode;
const getImage = require('../../../data/images').getImage;

const onPreventDefault = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };

exports.ExampleCategory = class extends DOMNode {
    constructor(opts) {
        super(opts);
        this._example  = opts.example;
        this._tabIndex = opts.tabIndex;
        this._dialog   = opts.dialog;
        this.initDOM(opts.parentNode);
    }

    initDOM(parentNode) {
        let example  = this._example;
        let children = [];
        example.list.forEach((item, index) => {
            children.push({
                id: (element) => {
                    element.addEventListener('mousedown', onPreventDefault);
                    element.addEventListener('mouseup',   onPreventDefault);
                    element.addEventListener(
                        'click',
                        (event) => {
                            this._dialog.onOpenExample(item.filename);
                            onPreventDefault(event);
                        }
                    );
                    element.addEventListener(
                        'keyup',
                        (event) => {
                            if ((event.keyCode === 13) || (event.keyCode === 32)) {
                                this._dialog.onOpenExample(item.filename);
                                onPreventDefault(event);
                            }
                        }
                    );
                },
                type:      'a',
                className: 'flt max-w example-category-item',
                tabIndex:  this._tabIndex + index,
                innerHTML: item.title
            });
        });
        this.create(
            parentNode,
            {
                className: 'example-category',
                children: [
                    {
                        className: 'flt title ' + example.className,
                        children: [
                            {
                                type: 'img',
                                src:  getImage(example.image)
                            },
                            {
                                type: 'br'
                            },
                            {
                                type:      'span',
                                innerHTML: example.title
                            }
                        ]
                    }
                ].concat(children)
            }
        );
    }
};

