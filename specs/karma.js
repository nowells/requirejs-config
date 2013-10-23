require.config({
    baseUrl: '/base/',
    paths: {
        chai: 'bower_components/chai/chai',
        underscore: 'bower_components/underscore/underscore',
        sinon: 'bower_components/sinonjs/sinon'
    },
    shim: {
        underscore: {
            exports: '_'
        }
    }
});

require(['specs/main'], function (specsMain) {
    specsMain();
    window.__karma__.start();
});
