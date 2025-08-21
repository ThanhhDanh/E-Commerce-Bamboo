const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const formatDate = require('./util/formatDate');
const validateInput = require('./util/validateInput');
const formatPrice = require('./util/formatPrice');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const { Server } = require('socket.io');
const chatSocket = require('./app/socket/chatSocket');
const app = express();
const port = 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

chatSocket(io); // Truy cập socket io

// 👇 cho các nơi khác có thể emit
app.set('io', io);

const sortMiddleware = require('./app/middlewares/sortMiddleware');

const route = require('./routes');
const db = require('./config/db');

//Connect to database
db.connect();

app.use(
    session({
        secret: 'm0n7K', // Chuỗi bí mật để mã hóa session
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: 'mongodb://127.0.0.1:27017/data_bamboo_dev', // Thay bằng URL MongoDB của bạn
            collectionName: 'sessions',
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        },
    }),
);

// Chặn cache để tránh lưu trạng thái cũ khi bấm nút "Quay lại"
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

const authMiddleware = require('./app/middlewares/authMiddleware');

//isActive
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

//Method
app.use(methodOverride('_method'));

// Address image
app.use(express.static(path.join(__dirname, 'public')));

//Custom middleware
app.use(sortMiddleware);
app.use(authMiddleware);

//Middleware
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

//HTTP Logger
app.use(morgan('combined'));

//Templates engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: require('./helpers/handlebars'),
    }),
);

app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources', 'views'));

//Routes Init
route(app);

server.listen(port, () => {
    console.log(`🚀 App + Socket.IO listening at http://localhost:${port}`);
});
