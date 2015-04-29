(function (cf, Hashes, _) {
    "use strict";

    cf.util = {};

    cf.util.md5 = (function () {
        var md5 = new Hashes.MD5();

        return function (s) {
            return md5.hex(s);
        };
    }());

    cf.util.Set = function () {
        var items = {};

        return {
            add: function (item) {
                items[item] = null;
            },

            has: function (item) {
                return _.has(items, item);
            },

            items: function (mapper) {
                var stuff = _.keys(items);
                if (mapper) {
                    stuff = _.map(stuff, mapper);
                }
                return stuff;
            }
        };
    };
}(window.cf, window.Hashes, window._));