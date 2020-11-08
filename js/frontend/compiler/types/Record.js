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

    _getWithRecord(record, parentScope, withOffset) {
        let withRecord = new exports.Record(parentScope, record.getName(), record.getGlobal(), record.getNamespace());
        record.getVars().forEach((vr) => {
            withRecord
                .addVar(vr.getToken(), vr.getName(), vr.getType(), vr.getArraySize(), vr.getPointer(), false)
                .setProc(vr.getProc())
                .setWithOffset(withOffset);
        });
        return withRecord;
    }

    getWithRecord(withOffset) {
        // Get the with scope with offset, also include the super objects with offsets...
        const getWithRecord = (record) => {
                let parentScope = record.getParentScope();
                if (parentScope instanceof exports.Record) {
                    parentScope = getWithRecord(parentScope);
                }
                return this._getWithRecord(record, parentScope, withOffset);
            };
        return getWithRecord(this);
    }
};
