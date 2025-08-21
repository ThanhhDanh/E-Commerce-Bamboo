const newsRouter = require('./news');
const siteRouter = require('./site');
const productsRouter = require('./products');
const categoriesRouter = require('./categories');
const shopsRouter = require('./shops');
const discountsRouter = require('./discounts');
const commentsRouter = require('./comments');
const likesRouter = require('./likes');
const reviewsRouter = require('./reviews');
const meRouter = require('./me');
const ordersRouter = require('./orders');
const chatRouter = require('./chat');
const webhookRouter = require('./webhook');
const indexRouterAPI = require('../routes/api/index');

function route(app) {
    app.use('/api/', indexRouterAPI);

    app.use('/webhook', webhookRouter);
    app.use('/chat', chatRouter);
    app.use('/orders', ordersRouter);
    app.use('/news', newsRouter);
    app.use('/products', productsRouter);
    app.use('/categories', categoriesRouter);
    app.use('/shops', shopsRouter);
    app.use('/discounts', discountsRouter);
    app.use('/comments', commentsRouter);
    app.use('/likes', likesRouter);
    app.use('/reviews', reviewsRouter);
    app.use('/me', meRouter);

    app.use('/', siteRouter);
}

module.exports = route;
