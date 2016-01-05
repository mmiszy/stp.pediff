module.exports = {
    config: {
        path: '/',
        options: {},
        media: {
            print: false
        },
        package: 'login',
        actions: []
    },
    execute: function () {
        this.thenOpen(this.config.environments[this.environment] + '/login');

        this.then(function () {
            this.waitUntilVisible('form[name="loginController.LoginForm"]');
        });

        this.then(function () {
            this.fillLabels('form[name="loginController.LoginForm"]', {
                Username: 'mm+firebase@thecometcult.com',
                Password: 'Samsung1!'
            });
        });
    },
    finish: function () {
        this.wait(2000, function () {
            this.save();
        });
    }
};
