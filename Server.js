import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import hbs from 'hbs';
import flash from 'connect-flash';
import cors from 'cors';
import { router } from './Routes/Router.js';
import sequelize from './DB_Connection/MySql_Connect.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const MySQLStore = require('express-mysql-session')(session);

// Load environment variables
dotenv.config();

// App setup
const app = express();
const PORT = process.env.PORT || 2024;

// Paths for __dirname and partials
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handlebars setup
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// Register Handlebars partials
const partialsPath = path.join(__dirname, 'Views', 'Templates', 'commonTemplate');
hbs.registerPartials(partialsPath);
console.log("Registering partials from:", partialsPath);

// Middleware setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Views', 'src', 'assets')));
app.use('/profile-images', express.static(path.join(__dirname, 'Views', 'src', 'ProfileImage')));

// Handlebars helpers
hbs.registerHelper('parseJson', (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
});
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue);

// Session setup with MySQL store
const sessionStore = new MySQLStore({
  host: '68.178.173.163',
  port: 3306,
  user: 'milleniancecom_ddspapp',
  password: '@$e$4~bzK5SS',
  database: 'milleniancecom_ddsp_app',
  checkExpirationInterval: 900000,
  expiration: 86400000,
});

app.use(
  session({
    key: 'session_cookie_name',
    secret: 'rashu@123',
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

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', router);

// Database connection and server start
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MySQL connection failed:", err);
  });
