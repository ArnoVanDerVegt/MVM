/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
exports.isElectron = function() {
    return ('electron' in window);
};

exports.isNode = function() {
    return (document.location.hostname === '127.0.0.1');
};
