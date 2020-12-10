/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const mathModuleConstants = require('../../../../shared/vm/modules/mathModuleConstants');
const VMModule            = require('./../VMModule').VMModule;
const RAD_TO_REG          = 180 / Math.PI;

exports.MathModule = class extends VMModule {
    run(commandId) {
        let vmData = this._vmData;
        switch (commandId) {
            case mathModuleConstants.MATH_ROUND:
                vmData.setNumberAtRet(Math.round(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_FLOOR:
                vmData.setNumberAtRet(Math.floor(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_CEIL:
                vmData.setNumberAtRet(Math.ceil(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_ABS:
                vmData.setNumberAtRet(Math.abs(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_NEG:
                vmData.setNumberAtRet(-Math.abs(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_RANDOM:
                let rnd = vmData.getRecordFromSrcOffset(['min', 'max']);
                rnd.max++;
                vmData.setNumberAtRet(rnd.min + Math.floor((rnd.max - rnd.min) * Math.random()));
                break;
            case mathModuleConstants.MATH_SIN:
                vmData.setNumberAtRet(Math.sin(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_COS:
                vmData.setNumberAtRet(Math.cos(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_TAN:
                vmData.setNumberAtRet(Math.tan(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_ASIN:
                vmData.setNumberAtRet(Math.asin(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_ACOS:
                vmData.setNumberAtRet(Math.acos(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_ATAN:
                vmData.setNumberAtRet(Math.atan(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_REMAINDER:
                let mod = vmData.getRecordFromSrcOffset(['value', 'remainder']);
                vmData.setNumberAtRet(mod.value - Math.floor(mod.value / mod.remainder) * mod.remainder);
                break;
            case mathModuleConstants.MATH_EXP:
                vmData.setNumberAtRet(Math.exp(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_SQRT:
                vmData.setNumberAtRet(Math.sqrt(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_LOG:
                vmData.setNumberAtRet(Math.log(vmData.getNumberAtRegOffset()));
                break;
            case mathModuleConstants.MATH_POW:
                let pow = vmData.getRecordFromSrcOffset(['base', 'exponent']);
                vmData.setNumberAtRet(Math.pow(pow.base, pow.exponent), 2);
                break;
            case mathModuleConstants.MATH_ODD:
                vmData.setNumberAtRet(((~~vmData.getRecordFromSrcOffset(['value']).value & 1) === 1) ? 1 : 0);
                break;
            case mathModuleConstants.MATH_EVEN:
                vmData.setNumberAtRet(((~~vmData.getRecordFromSrcOffset(['value']).value & 1) === 0) ? 1 : 0);
                break;
            case mathModuleConstants.MATH_IK_RAD:
                let ikRad = vmData.getRecordFromSrcOffset(['result1', 'result2', 'deltaX', 'deltaY', 'len1', 'len2']);
                this.inverseKinematic(ikRed);
                setNumberAtRegOffset(ikRad.result1, 0);
                setNumberAtRegOffset(ikRad.result2, 1);
                break;
            case mathModuleConstants.MATH_IK_DEG:
                let ikDeg = vmData.getRecordFromSrcOffset(['result1', 'result2', 'deltaX', 'deltaY', 'len1', 'len2']);
                this.inverseKinematic(ikRed);
                setNumberAtRegOffset(ikDeg.result1 * RAD_TO_REG, 0);
                setNumberAtRegOffset(ikDeg.result2 * RAD_TO_REG, 1);
                break;
        }
    }

    inverseKinematic(opts) {
        let deltaX = opts.deltaX;
        let deltaY = opts.deltaY;
        let lenA   = opts.len1;
        let lenB   = opts.len2;
        let dist2  = deltaX * deltaX + deltaY * deltaY;
        let lenA2  = lenA * lenA;
        let lenB2  = lenB * lenB;
        opts.result1 = Math.min(Math.max((dist2 + lenA2 - lenB2) / (2 * lenA * Math.sqrt(dist2)), -1), 1);
        opts.result2 = Math.min(Math.max((dist2 - lenA2 - lenB2) / (2 * lenA * lenB), -1), 1);
    }
};
