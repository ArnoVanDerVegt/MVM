const Tree    = require('../../../lib/components/tree/Tree').Tree;
const VarView = require('./VarView').VarView;
const getSpan = require('../spans').getSpan;

exports.VarViewNumber = class extends VarView {
    initDOM(parentNode) {
        let vr         = this._vr;
        let baseOffset = this._baseOffset;
        let offset     = baseOffset + vr.getOffset();
        let arraySize  = vr.getArraySize();
        let node       = {
                className: 'wheel',
                children:  []
            };
        if (arraySize === false) {
            node.innerHTML = getSpan(this.getValue(offset), 'number');
        } else {
            node.children.push({
                ref:  this.setRef('tree'),
                type: Tree,
                ui:   this._ui,
                tree: this._tree
            });
        }
        this.create(parentNode, node);
    }

    updateTree(tree) {
        this._refs.tree.update(tree);
    }
};
