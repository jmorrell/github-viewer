// Application.
var app = require("app");

// Modules.
var Repo = require("modules/repo");

exports.Collection = Backbone.Collection.extend({
  url: function() {
    return "https://api.github.com/orgs/" + this.org + "/members?callback=?";
  },

  cache: true,

  parse: function(obj) {
    // Safety check ensuring only valid data is used.
    if (obj.data.message !== "Not Found") {
      this.status = "valid";

      return obj.data;
    }

    this.status = "invalid";

    return obj;
  },

  initialize: function(models, options) {
    if (options) {
      this.org = options.org;
    }
  }
});

exports.Views = {
  Item: Backbone.View.extend({
    template: "user/item",

    tagName: "li",

    serialize: function() {
      return { model: this.model };
    },

    events: {
      click: "changeUser"
    },

    changeUser: function(ev) {
      var model = this.model;
      var org = app.router.users.org;
      var name = model.get("login");

      app.router.go("org", org, "user", name);
    },

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    }
  }),

  List: Backbone.View.extend({
    template: "user/list",

    serialize: function() {
      return { collection: this.options.users };
    },

    beforeRender: function() {
      this.options.users.each(function(user) {
        this.insertView("ul", new exports.Views.Item({
          model: user
        }));
      }, this);
    },

    afterRender: function() {
      // Only re-focus if invalid.
      this.$("input.invalid").focus();
    },

    initialize: function() {
      // Whenever the collection resets, re-render.
      this.listenTo(this.options.users, "reset", this.render);

      // Show a spinner while fetching.
      this.listenTo(this.options.users, "fetch", function() {
        this.$("ul").parent().html("<img src='/app/img/spinner-gray.gif'>");
      }, this);
    },

    events: {
      "submit form": "updateOrg"
    },

    updateOrg: function(ev) {
      app.router.go("org", this.$(".org").val());

      return false;
    }
  })
};
