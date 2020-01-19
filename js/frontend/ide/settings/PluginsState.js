/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher   = require('../../lib/dispatcher').dispatcher;
const Emitter      = require('../../lib/Emitter').Emitter;
const PluginsState = require('./PluginsState').PluginsState;

exports.PluginsState = class extends Emitter {
    constructor(opts) {
        super(opts);
        this._settings = opts.settings;
        this._plugins  = this.getDefaultPlugins();
        this._updatePluginByUuid();
        dispatcher.on('Settings.Set.PluginPropertyByUuid', this, this._setPluginPropertyByUuid);
        dispatcher.on('Settings.Toggle.PluginByUuid',      this, this._togglePluginByUuid);
    }

    _updatePluginByUuid() {
        let pluginByUuid = {};
        this._plugins.forEach(function(plugin) { pluginByUuid[plugin.uuid] = plugin; });
        this._pluginByUuid = pluginByUuid;
    }

    _togglePluginByUuid(uuid) {
        let plugin = this.getPluginByUuid(uuid);
        if (!plugin) {
            return;
        }
        this._setPluginPropertyByUuid(uuid, 'visible', !plugin.visible);
    }

    _setPluginPropertyByUuid(uuid, property, value) {
        let plugin = this.getPluginByUuid(uuid);
        if (!plugin) {
            return;
        }
        plugin[property] = value;
        this._settings.save();
        this._settings.emit('Settings.Plugin');
    }

    getDefaultPlugins() {
        return [
            {
                uuid:    '975b784e-3886-11ea-a137-2e728ce88125',
                group:   'EV3',
                name:    'EV3 Motors',
                path:    'ev3motors',
                visible: true,
                order:   1
            },
            {
                uuid:    'a8e77680-3886-11ea-a137-2e728ce88125',
                group:   'EV3',
                name:    'EV3',
                path:    'ev3',
                visible: true,
                order:   2
            },
            {
                uuid:    'b643ac7c-3886-11ea-a137-2e728ce88125',
                group:   'EV3',
                name:    'EV3 Sensors',
                path:    'ev3sensors',
                visible: true,
                order:   3
            },
            {
                uuid:    '26ade4b0-3a07-11ea-a137-2e728ce88125',
                group:   'Graph',
                name:    'Sensor output graph',
                path:    'graph',
                visible: false,
                order:   4
            },
            {
                uuid:    'bea9f98e-3886-11ea-a137-2e728ce88125',
                group:   'PSP',
                name:    'PSP',
                path:    'psp',
                visible: false,
                order:   5
            }
        ];
    }

    getSortedPlugins() {
        let plugins  = [];
        this._plugins.forEach(function(plugin) {
            plugins.push(Object.assign(
                {
                    toString: function() {
                        let order = ('000' + this.order).substr(-3);
                        return this.group + '_' + order + '_' + this.name;
                    }
                },
                plugin
            ));
        });
        plugins.sort();
        return plugins;
    }

    getPluginByUuid(uuid) {
        return this._pluginByUuid[uuid] || null;
    }

    load(data) {
        let plugins           = this.getDefaultPlugins();
        let pluginIndexByUuid = {};
        plugins.forEach(function(plugin, index) {
            pluginIndexByUuid[plugin.uuid] = index;
        });
        data.forEach(function(plugin) {
            if (plugin.uuid in pluginIndexByUuid) {
                let index         = pluginIndexByUuid[plugin.uuid];
                let defaultPlugin = plugins[index];
                plugins[index] = Object.assign(defaultPlugin, plugin);
            } else {
                pluginIndexByUuid[plugin.uuid] = plugins.length;
                plugins.push(plugin);
            }
        });
        this._plugins = plugins;
        this._updatePluginByUuid();
    }

    loadDefaults() {
        this._plugins = this.getDefaultPlugins();
        this._updatePluginByUuid();
    }

    toJSON() {
        return Object.assign([], this._plugins);
    }
};
