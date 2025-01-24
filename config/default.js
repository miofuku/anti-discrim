module.exports = {
    app: {
        name: 'CounterWind',
        url: process.env.NODE_ENV === 'production' 
            ? 'https://counterwind.de'
            : 'http://localhost:3000'
    },
    cors: {
        origins: process.env.NODE_ENV === 'production'
            ? ['https://counterwind.de', 'https://www.counterwind.de']
            : ['http://localhost:3000']
    },
}; 