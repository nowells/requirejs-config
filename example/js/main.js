define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    $('body').append('Successfully loaded RequireJS from config: ' + module.config().data);
});
