module.exports = {
    specDir: __dirname + '/spec',
    resultsDir: process.cwd() + '/pediff',
    environments: [
        {
            name: '.production',
            baseUrl: 'http://app.trndz.io'
        },
        {
            name: '.dev',
            baseUrl: 'http://localhost:9000'
        }
    ],
    viewports: [
        {
            name: 'mobile',
            icon: 'phone_iphone',
            width: 320,
            height: 480
        },
        {
            name: 'tablet',
            icon: 'tablet_mac',
            width: 768,
            height: 1024
        },
        {
            name: 'web',
            icon: 'desktop_mac',
            width: 1280,
            height: 800
        }
    ]
};
