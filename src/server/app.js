const express = require('express')
const { Server } = require('socket.io')
const mongoose = require('mongoose');
const path = require('path')
const session = require('express-session');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const exphbs = require('express-handlebars');
const app = express();
const passport = require('passport'); 

// Rutas
const productsRouter = require('../routes/products.router');
const productsEditRouter = require('../routes/productseditid.router');
const productsdeletebyidRouter = require('../routes/productsdeletebyid.router');
const productsIdRouter = require('../routes/productsid.router');
const productsTableRouter = require('../routes/productstable.router');
const cartRouter = require('../routes/carts.router');
const cartDeleteByIdRouter = require('../routes/cartsDeleteById.router');
const indexRouter = require('../routes/index.router');
const chatRouter = require('../routes/chat.router');
const productsInRealTimeRouter = require('../routes/productsInRealTime');
const productsEditByIdRouter = require('../routes/productseditbyid.router');
const loginRouter = require('../routes/login.router')
const loginGithubRouter = require('../routes/logingithub.router')
const singupRouter = require('../routes/signup.router')
const logoutRouter = require('../routes/logout.router')
const checkoutRouter = require('../routes/checkout.router')
const usersRouter = require('../routes/users.router')
const signupAdminRouter = require('../routes/signupadmin.router')
const adminPanel = require('../routes/adminPanel.router')

// Passport Github
const initializePassport = require('../middlewares/passportGithub');
initializePassport();

//Server Up
const port = 8080;
const httpServer = app.listen(port, () => console.log(`Server Up en http://localhost:${port}`))
const socketServer = new Server(httpServer)

// Cargar las variables de entorno
require('dotenv').config();

// Obtener los valores de las variables de entorno
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDatabase = process.env.MONGO_DATABASE;

// Crea la URL de conexión a partir de las variables de entorno
const mongoUrl = `${mongoHost}${mongoUser}:${mongoPassword}${mongoPort}${mongoDatabase}`;

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoUrl);
        console.log(`Conexión exitosa a la base de datos "${mongoDatabase}"`);
    } catch (error) {
        console.log(`No se puede conectar a la Base de Datos. Error: ${error}`);
        process.exit();
    }
}

connectToDatabase();

// Configurar el middleware express-session con MongoStore 
const secret = process.env.SECRET;
app.use(
    session({
        secret: secret,
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: mongoUrl,
            dbName: 'ecommerce',
            collectionName: 'sessions',
            mongoOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        }),
    })
);
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.user ? true : false;
    res.locals.userRole = req.session.user ? req.session.user.role : null;
    next();
});

// Inicializa Passport y lo usa en la aplicación
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

// Configurar Handlebars como motor de plantillas
const handlebarsOptions = {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
};

app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    })
);



app.set('view engine', 'handlebars');


// Configuracion de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Configuracion de los metodos de envio de formulario
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Configuracion de las Rutas Principales
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'))

// Configurar el middleware express-flash
const flash = require('express-flash');
app.use(flash());

// Vistas
app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/productstable', productsTableRouter);
app.use('/productsdeletebyid', productsdeletebyidRouter);
app.use('/productsedit', productsEditRouter);
app.use('/productseditbyid', productsEditByIdRouter);
app.use('/productsid', productsIdRouter);
app.use('/carts', cartRouter);
app.use('/chat', chatRouter);
app.use('/login', loginRouter);
app.use('/signup', singupRouter);
app.use('/logout', logoutRouter);
app.use('/realTimeProducts', productsInRealTimeRouter);
app.use('/cartsDeleteById', cartDeleteByIdRouter);
app.use('/checkout', checkoutRouter);
app.use('/users', usersRouter);
app.use('/signupadmin', signupAdminRouter);
app.use('/github', loginGithubRouter); 
app.use('/admin_panel', adminPanel); 

//Chat Socket
const Chat = require('../models/messages.model');

let log = []
let newproduct = []

socketServer.on('connection', (socketClient) => {
    let queryUser = socketClient.handshake.query.user;
    console.log(`Nuevo cliente "${queryUser}" conectado...`);


    socketClient.on('message', (data) => {
        console.log(`${data.user} Envió: ${data.message}`);
        log.push(data);
        socketClient.emit('history', log);
        socketClient.broadcast.emit('history', log);


        Chat.findOneAndUpdate({ user: data.user }, { $push: { message: data.message } }, { upsert: true })
            .then(() => {
                console.log(`El Mensaje de ${data.user} se guardó en el modelo`);
            })
            .catch(err => {
                console.error('Error al guardar el mensaje en el modelo:', err);
            });
    });


    socketClient.on('product', (dataProd) => {
        newproduct.push(dataProd);
        socketClient.emit('product-list', newproduct);
        socketClient.broadcast.emit('product-list', newproduct);
    });

    socketClient.broadcast.emit('newUser', queryUser);
});