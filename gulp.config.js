module.exports = function() {

    // TODO: replace paths with path-object, f.ex. path.TEMP_DIR etc.
    
    var rootDir = '.';

    var sourceDir = rootDir + '/src';

    var clientDir = sourceDir + '/client';

    var serverDir = sourceDir + '/server';

    var clientScripts = clientDir + '/scripts';

    var config = {

        /*
         * file paths
         */

        // dir for temporary files
        temp: rootDir + '/.temp',

        // all js-files we want to check for styling issues
        jsfiles: [
            sourceDir + '/**/*.js',
            rootDir + '/*.js'
        ],

        indexFile: clientDir + '/index.html',

        client: clientDir,

        clientjs: [
            clientScripts + '**/*.js'
            // exclude by prefixing with a bang: f.ex. '!*.spec.js
        ],

        // all less files to compile into css etc.
        less: [
            clientDir + '/styles/*.less'
        ],

        bower: {
            json: require(rootDir + '/bower.json'),
            directory: rootDir + '/bower_components/',
            ignorePath: '../..' // ignores path prefixes
        }
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
