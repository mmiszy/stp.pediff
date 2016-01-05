module.exports = {
    config: {
        path: '/',
        options: {},
        media: {
            print: false
        },
        package: 'dashboard',
        actions: []
    },
    execute: function () {
        require('./login').execute.call(this);

        this.then(function () {
            this.click({
                type: 'xpath',
                path: './/button[contains(., "Log in")]'
            });
        });

        this.then(function () {
            this.waitUntilVisible('.dashboard-container--current-view');
        });
    },
    finish: function () {
        this.wait(2000, function () {
            this.save();
        });
    }
};
