/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const Scope = require('./Scope').Scope;

exports.Record = class extends Scope {
    constructor(parentScope, name, global, namespace) {
        super(parentScope, name, global, namespace);
        this._unionSize = 0;
    }

    union() {
        if (this._unionSize === 0) {
            this._unionSize = this._size;
            this._size      = 0;
            return true;
        }
        let result = (this._size === this._unionSize);
        this._size = 0;
        return result;
    }

    checkUnion() {
        return (this._unionSize === 0) || (this._unionSize === this._size);
    }

    getWithRecord(withOffset) {
        let record = new exports.Record(this._parentScope, this._name, this._global, this._namespace);
        this._vars.forEach((vr) => {
            record
                .addVar(vr.getToken(), vr.getName(), vr.getType(), vr.getArraySize(), vr.getPointer(), false)
                .setProc(vr.getProc())
                .setWithOffset(withOffset);
        });
        return record;
    }
};
