import express from 'express';
import cluster from 'cluster';
import dotenv from 'dotenv';
import os from 'os';
import sequelize from "./DB_Connection/MySql_Connect.js";
import { router } from './Routes/Router.js';
import hbs from 'hbs'
import path from 'path';
import { fileURLToPath } from 'url';
import flash from 'connect-flash';
import cors from 'cors'; 
import { createRequire } from 'module';
import session from 'express-session';
import Handlebars from 'handlebars';

const require = createRequire(import.meta.url);
const MySQLStore = require('express-mysql-session')(session);

dotenv.config();

// Registering the custom helper to parse JSON
hbs.registerHelper('parseJson', function (jsonString) {
  try {
      return JSON.parse(jsonString);
  } catch (err) {
      console.error('Invalid JSON string:', jsonString);
      return [];
  }
});

// Register a helper for greater than
hbs.registerHelper('gt', function (value1, value2) {
    return value1 > value2;
});

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});

// Register the 'isObject' helper for Handlebars to check if a value is an object
hbs.registerHelper('isObject', function(value) {
  return typeof value === 'object' && value !== null;
});

hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('fallback', function (value, fallbackValue) {
  return value || fallbackValue;
});



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



app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.set('views', path.join(__dirname, 'src', 'views')); 
app.set('views', path.join(__dirname, 'Views', 'Templates'));
hbs.registerPartials(path.join(__dirname, 'Views', 'Templates', 'commonTemplate'));
// app.use(express.static(path.join(__dirname, 'src', 'assets')))

app.use(express.static(path.join(__dirname, 'Views', 'src', 'assets')));

app.use('/profile-images', express.static(path.join(__dirname, 'Views', 'src', 'ProfileImage')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const Port = process.env.PORT || 2024;

// Configure MySQL session store
const sessionStore = new MySQLStore({
  host: '127.0.0.1', // Your MySQL host
  port: 3306, // Your MySQL port
  user: 'root', // Your MySQL username
  password: 'root@123', // Your MySQL password
  database: 'ddsp', // Your database name
});


app.use(
  session({
    key: 'session_cookie_name', // Name of the session cookie
    secret: 'rashu@123', // Replace with a strong secret
    store: sessionStore, // Use MySQL session store
    resave: false, // Avoid resaving session if not modified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, 
      secure: false, 
    },
  })
);
app.use(flash());

// Pass session data to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', router);

// Function to start the server
const startServer = () => {
  sequelize.sync().then(() => {
    
    app.listen(Port, () => {
      console.log(`Server running on port: http://localhost:${Port}`);
    });
  }).catch((err) => {
    console.error("MySQL connection failed:", err);
  });
};

// Check if the current process is a master
if (cluster.isMaster) {
  const numCPUs = os.cpus().length; // Get the number of CPU cores

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  startServer();
}
