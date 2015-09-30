module.exports = function() {

    // TODO: replace paths with path-object, f.ex. path.TEMP_DIR etc.

    var rootDir = '.';

    var sourceDir = rootDir + '/src';

    var clientDir = sourceDir + '/client';

    var serverDir = sourceDir + '/server';

    var clientScripts = clientDir + '/scripts';

    var tempDir = rootDir + '/.temp';

    var server = './src/server/';

    var config = {

        /*
         * file paths
         */

        // dir for temporary files
        temp: tempDir,

        build: './build',

        fonts: [
            './bower_components/bootstrap/fonts/**/*.*',
            './bower_components/font-awesome/fonts/**/*.*'
        ],

        images: [
            clientDir + '/images/**/*.*'
        ],

        // all js-files we want to check for styling issues
        jsfiles: [
            sourceDir + '/**/*.js',
            rootDir + '/*.js'
        ],

        jsxFiles: [
            clientDir + '/scripts/script.js'
        ],

        indexFile: clientDir + '/index.html',

        client: clientDir,

        builtjs: [
            tempDir + '/script.js'
        ],

        builtcss: [
            tempDir + '/style.css'
        ],

        builtjsDir: tempDir + '/scripts',

        clientjs: [
            clientScripts + '/**/*.js'
            // exclude by prefixing with a bang: f.ex. '!*.spec.js
        ],

        // all less files to compile into css etc.
        less: [
            clientDir + '/styles/*.less'
        ],

        server: server,

        bower: {
            json: require(rootDir + '/bower.json'),
            directory: rootDir + '/bower_components/',
            ignorePath: '../..' // ignores path prefixes
        },

        /*
         * Node settings
         */

        defaultPort: 7203,
        nodeServer: 'src/server/app.js',

        /*
         * BrowserSync
         */
        browserReloadDelay: 1000
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    return config;
};
