module.exports = function() {
    var config = {

        // all js-files we want to check for styling issues
        jsfiles: [
            './src/**/*.js',
            './*.js'
        ]
    };

    return config;
};
