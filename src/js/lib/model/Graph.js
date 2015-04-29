(function (cf, Backbone, _) {
    "use strict";

    cf.Graph = Backbone.Model.extend({
        constructor: function (options) {
            Backbone.Model.call(this, {}, options || {});
        },

        initialize: function (attributes, options) {
            if (!options.adapter) {
                throw cf.error.required("adapter");
            }

            this.adapter = new options.adapter(options.options);

            this.nodes = new cf.util.Set();
            this.links = new cf.util.Set();

            this.set("nodes", []);
            this.set("links", []);
        },

        getNeighborhood: function (options) {
            var nbd = this.adapter.getNeighborhood(options),
                newNodes = [],
                newLinks = [];

            _.each(nbd.nodes, _.bind(function (node) {
                if (!this.nodes.has(node.key)) {
                    this.nodes.add(node.key);
                    newNodes.push(node);
                }
            }, this));

            _.each(nbd.links, _.bind(function (link) {
                var linkKey = JSON.stringify([link.source.key, link.target.key]);
                if (!this.links.has(linkKey)) {
                    this.links.add(linkKey);
                    newLinks.push(link);
                }
            }, this));

            this.set("nodes", this.get("nodes").concat(newNodes));
            this.set("links", this.get("links").concat(newLinks));
        }
    });
}(window.cf, window.Backbone, window._));