import express from 'express';
import dotenv from 'dotenv';
import sequelize from './DB_Connection/MySql_Connect.js';
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

// Validate required environment variables
['SESSION_SECRET', 'ACCESS_TOKEN_SECRET'].forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing environment variable: ${varName}`);
    process.exit(1);
  }
});

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 2024;

// Configure Handlebars
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', path.join(__dirname, 'Views', 'Templates'));
hbs.registerPartials(path.join(__dirname, 'Views', 'Templates', 'commonTemplate'));

// Register Handlebars helpers
hbs.registerHelper('parseJson', (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
});
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('isObject', (value) => typeof value === 'object' && value !== null);
hbs.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue);

// Middleware setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Views', 'src', 'assets')));
app.use('/profile-images', express.static(path.join(__dirname, 'Views', 'src', 'ProfileImage')));

// Configure session with MySQL session store
const sessionStore = new MySQLStore({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root@123',
  database: 'ddsp',
});
app.use(
  session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: false,
    },
  })
);

// Flash message middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', router);

// Start server
const startServer = () => {
  sequelize
    .sync()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MySQL connection failed:', err);
    });
};

startServer();
