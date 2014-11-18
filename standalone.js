/*
 *
 * This is used to build the bundle with browserify.
 *
 * The bundle is used by people who doesn't use browserify.require
 * Those who use browserify will install with npm and require the module,
 * the package.json file points to index.js.
 */
var AmidoProfileService = require('./');

// use amd or just throught to window object.
if (typeof global.window.define == 'function' && global.window.define.amd) {
    global.window.define('AmidoProfileService', function () { return AmidoProfileService; });
} else if (global.window) {
    global.window.AmidoProfileService = AmidoProfileService;
}