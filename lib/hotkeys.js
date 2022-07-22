"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotkey_display = exports.hotkeys = exports.unload_hotkeys = exports.load_hotkeys = void 0;
var react_1 = __importDefault(require("react"));
var mousetrap_1 = __importDefault(require("mousetrap"));
var lodash_1 = __importDefault(require("lodash"));
mousetrap_1.default.prototype.stopCallback = function () { return false; };
var default_options = {
    hot_key_property_name: 'hot_keys',
};
var global_hotkeys = {};
var hotkey_get_handler = function (hotkey) { return function (e, combo) {
    var handlers = global_hotkeys[hotkey];
    var propagate = true;
    lodash_1.default.forEach(handlers, function (_a) {
        var handler = _a.handler;
        if (!propagate)
            return;
        propagate = handler(e, combo);
    });
    return propagate;
}; };
var load_hotkeys = function (handlers) {
    lodash_1.default.forEach(handlers, function (response, hotkey) {
        var _a;
        if (global_hotkeys[hotkey] == null) {
            global_hotkeys[hotkey] = [response];
            mousetrap_1.default.bind(hotkey, hotkey_get_handler(hotkey));
        }
        else {
            (_a = global_hotkeys[hotkey]) === null || _a === void 0 ? void 0 : _a.push(response);
            global_hotkeys[hotkey] = lodash_1.default.sortBy(global_hotkeys[hotkey], 'priority').reverse();
        }
    });
};
exports.load_hotkeys = load_hotkeys;
var unload_hotkeys = function (handlers) {
    lodash_1.default.forEach(handlers, function (response, hotkey) {
        var _a;
        if (Array.isArray(global_hotkeys[hotkey])) {
            lodash_1.default.remove(global_hotkeys[hotkey], response);
        }
        if (((_a = global_hotkeys[hotkey]) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            global_hotkeys[hotkey] = null;
            mousetrap_1.default.unbind(hotkey);
        }
    });
};
exports.unload_hotkeys = unload_hotkeys;
var hotkeys = function (Component, overwrites) {
    if (overwrites === void 0) { overwrites = {}; }
    var options = __assign(__assign({}, default_options), overwrites);
    return /** @class */ (function (_super) {
        __extends(HotKeysWrapper, _super);
        function HotKeysWrapper() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.wrapped_component = undefined;
            _this.getWrappedComponent = function () { return _this.wrapped_component; };
            _this.on_ref_update = function (ref) {
                _this.wrapped_component = ref;
            };
            return _this;
        }
        HotKeysWrapper.prototype.componentDidMount = function () {
            var handlers = this.wrapped_component[options.hot_key_property_name];
            if (handlers == null) {
                console.warn("Component: " + Component.displayName + " did not provide hotkey handlers");
                return;
            }
            exports.load_hotkeys(handlers);
        };
        HotKeysWrapper.prototype.componentWillUnmount = function () {
            var handlers = this.wrapped_component[options.hot_key_property_name];
            if (handlers == null)
                return;
            exports.unload_hotkeys(handlers);
        };
        HotKeysWrapper.prototype.render = function () {
            return react_1.default.createElement(Component, __assign({ ref: this.on_ref_update }, this.props));
        };
        return HotKeysWrapper;
    }(react_1.default.PureComponent));
};
exports.hotkeys = hotkeys;
exports.default = exports.hotkeys;
var hotkey_display = function (shortcut) {
    var am_mac = window.navigator.appVersion.indexOf('Mac') !== -1;
    if (!am_mac)
        return shortcut;
    var mac_shortcut = shortcut.replace('alt', 'option');
    return mac_shortcut.replace('meta', '⌘');
};
exports.hotkey_display = hotkey_display;
//# sourceMappingURL=hotkeys.js.map