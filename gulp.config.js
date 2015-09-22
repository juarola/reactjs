module.exports = function() {

    var rootDir = '.';

    var sourceDir = rootDir + '/src';

    var clientDir = sourceDir + '/client';

    var serverDir = sourceDir + '/server';

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

        // all less files to compile into css etc.
        less: [
            clientDir + '/styles/*.less'
        ]
    };

    return config;
};
