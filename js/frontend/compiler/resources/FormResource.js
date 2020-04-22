/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const getDataProvider = require('../../lib/dataprovider/dataProvider').getDataProvider;
const dispatcher      = require('../../lib/dispatcher').dispatcher;
const path            = require('../../lib/path');
const ProjectResource = require('./ProjectResource').ProjectResource;

exports.FormResource = class extends ProjectResource {
    constructor(opts) {
        super(opts);
        this._wfrm = null;
    }

    canSave() {
        return false;
    }

    neededBeforeCompile() {
        return true;
    }

    getWFrm() {
        return this._wfrm;
    }

    getData(callback) {
        this._getDataProvider().getData(
            'post',
            'ide/file',
            {filename: path.join(this._projectPath, this._filename)},
            (function(data) {
                try {
                    data       = JSON.parse(data);
                    this._wfrm = JSON.parse(data.data.wfrm);
                } catch (error) {
                    this._wfrm = null;
                }
                callback({});
            }).bind(this)
        );
    }
};
