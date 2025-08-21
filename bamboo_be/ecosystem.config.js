module.exports = {
    apps: [
        {
            name: 'web-server',
            script: 'src/index.js',
            watch: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'messages',
            script: 'src/workers/messageWorker.js',
            watch: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
