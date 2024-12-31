import express from 'express';
import dotenv from 'dotenv';
import sequelize from "./DB_Connection/MySql_Connect.js";
import { router } from './Routes/Router.js';
import hbs from 'hbs';
import path from 'path';
import { fileURLToPath } from 'url';
import flash from 'connect-flash';
import cors from 'cors';
import { createRequire } from 'module';
import session from 'express-session';

const require = createRequire(import.meta.url);
const MySQLStore = require('express-mysql-session')(session);

dotenv.config();

// Registering the custom helpers
hbs.registerHelper('parseJson', function (jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Invalid JSON string:', jsonString);
    return [];
  }
});

hbs.registerHelper('gt', (value1, value2) => value1 > value2);
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('isObject', value => typeof value === 'object' && value !== null);
hbs.registerHelper('ifEquals', (arg1, arg2, options) =>
  arg1 === arg2 ? options.fn(this) : options.inverse(this)
);
hbs.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue);

const requiredEnvVars = ['SESSION_SECRET', 'ACCESS_TOKEN_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing environment variable ${varName}`);
    process.exit(1);
  }
});

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure view engine and partials
app.set('view engine', 'html');
app.engine('html', hbs.__express);
hbs.registerPartials(path.join(__dirname, 'Views', 'Templates', 'commonTemplate'));
app.set('views', path.join(__dirname, 'Views', 'Templates'));

// Configure static files
app.use(express.static(path.join(__dirname, 'Views', 'src', 'assets')));
app.use('/profile-images', express.static(path.join(__dirname, 'Views', 'src', 'ProfileImage')));

// Parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session with MySQL session store
const sessionStore = new MySQLStore({
  host: '68.178.173.163',
  port: 3306,
  user: 'milleniancecom_ddspapp',
  password: '@$e$4~bzK5SS',
  database: 'milleniancecom_ddsp_app',
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  endConnectionOnClose: false,
});

app.use(
  session({
    key: 'session_cookie_name',
    secret: 'rashu@123', // Replace with a strong secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(flash());

// Pass session data and flash messages to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', router);

const Port = process.env.PORT || 2024;

// Start the server
const startServer = () => {
  sequelize.sync()
    .then(() => {
      app.listen(Port, () => {
        console.log(`Server running on port: http://localhost:${Port}`);
      });
    })
    .catch((err) => {
      console.error("MySQL connection failed:", err);
    });
};

startServer();
