(function (clique, Backbone, _) {
    "use strict";

    clique.view.SelectionInfo = Backbone.View.extend({
        initialize: function (options) {
            var debRender;

            clique.util.require(this.model, "model");
            clique.util.require(options.graph, "graph");

            options = options || {};
            this.graph = options.graph;

            debRender = _.debounce(this.render, 100);

            this.listenTo(this.model, "change", debRender);
            this.listenTo(this.model, "focused", debRender);
            this.listenTo(this.graph, "change", debRender);
        },

        hideNode: function (node) {
            node.setTransient("selected", false);
            node.clearTransient("root");
            this.graph.removeNeighborhood({
                center: node,
                radius: 0
            });
        },

        deleteNode: function (node, deleted) {
            if (deleted) {
                node.setData("deleted", true);
                this.hideNode(node);
            } else {
                node.clearData("deleted");
                this.render();
            }
        },

        expandNode: function (node) {
            this.graph.addNeighborhood({
                center: node,
                radius: 1
            });
        },

        collapseNode: function (node) {
            var loners,
                mutators;

            // Find all neighbors of the node that have degree 1.
            loners = _.filter(this.graph.neighbors(node), function (nbr) {
                return this.graph.degree(nbr) === 1;
            }, this);

            // Extract the mutator objects for these nodes.
            mutators = _.map(loners, function (key) {
                return this.graph.adapter.getMutator({
                    _id: {
                        $oid: key
                    }
                });
            }, this);

            // Hide them.
            _.each(mutators, _.partial(this.hideNode, _, false), this);
        },

        render: function () {
            var focused,
                renderTemplate;

            renderTemplate = _.bind(function (node) {
                this.$el.html(clique.template.selectionInfo({
                    node: node,
                    degree: node ? this.graph.degree(node.key()) : -1,
                    selectionSize: this.model.size()
                }));

                this.$("a.prev")
                    .on("click", _.bind(function () {
                        this.model.focusLeft();
                    }, this));

                this.$("a.next")
                    .on("click", _.bind(function () {
                        this.model.focusRight();
                    }, this));

                this.$("button.remove").on("click", _.bind(function () {
                    this.graph.adapter.findNode({key: this.model.focused()})
                        .then(_.bind(this.hideNode, this));
                }, this));

                this.$("button.remove-sel").on("click", _.bind(function () {
                    _.each(this.model.items(), _.bind(function (key) {
                        this.graph.adapter.findNode({key: key})
                            .then(_.bind(this.hideNode, this));
                    }, this));
                }, this));

                this.$("button.delete").on("click", _.bind(function () {
                    this.graph.adapter.findNode({key: this.model.focused()})
                        .then(_.bind(function (node) {
                            this.deleteNode(node, !node.getData("deleted"));
                        }, this));
                }, this));

                this.$("button.delete-sel").on("click", _.bind(function () {
                    _.each(this.model.items(), _.bind(function (key) {
                        this.graph.adapter.findNode({key: key})
                            .then(_.bind(this.deleteNode, this, _, true));
                    }, this));
                }, this));

                this.$("button.expand").on("click", _.bind(function () {
                    this.graph.adapter.findNode({key: this.model.focused()})
                        .then(_.bind(this.expandNode, this));
                }, this));

                this.$("button.expand-sel").on("click", _.bind(function () {
                    _.each(this.model.items(), _.bind(function (key) {
                        this.graph.adapter.findNode({ key: key})
                            .then(_.bind(this.expandNode, this));
                    }, this));
                }, this));

                this.$("button.collapser").on("click", _.bind(function () {
                    this.collapseNode(this.model.focused());
                }, this));
            }, this);

            focused = this.model.focused();

            if (!focused) {
                renderTemplate(focused);
            } else {
                this.graph.adapter.findNode({key: focused})
                    .then(renderTemplate);
            }
        }
    });
}(window.clique, window.Backbone, window._));
