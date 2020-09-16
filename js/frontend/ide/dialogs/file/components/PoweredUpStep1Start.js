/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher   = require('../../../../lib/dispatcher').dispatcher;
const DOMNode      = require('../../../../lib/dom').DOMNode;
const Button       = require('../../../../lib/components/Button').Button;
const Dropdown     = require('../../../../lib/components/Dropdown').Dropdown;
const getImage     = require('../../../data/images').getImage;
const Step         = require('./Step').Step;

exports.PoweredUpStep1Start = class extends Step {
    initContent() {
        return {
            className: 'step-content step1',
            children: [
                {
                    className: 'text',
                    children: [
                        {
                            innerHTML: 'With this wizard you can create a Powered up project. It helps you setup the following items:'
                        },
                        {
                            type: 'ul',
                            children: [
                                {
                                    type:      'li',
                                    innerHTML: 'A project file'
                                },
                                {
                                    type:      'li',
                                    innerHTML: 'Code to connect to different Powered Up devices'
                                },
                                {
                                    type:      'li',
                                    innerHTML: 'Code to connect to different motors and sensors'
                                },
                                {
                                    type:      'li',
                                    innerHTML: 'An -optional- application form'
                                },
                                {
                                    type:      'li',
                                    innerHTML: 'Include library files in your project'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'img',
                    src:  getImage('images/poweredup/technicHub256.png')
                }
            ]
        };
    }
};
