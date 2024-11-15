import express from 'express';
import cluster from 'cluster';
import dotenv from 'dotenv';
import session from 'express-session';
import os from 'os';
import sequelize from "./DB_Connection/MySql_Connect.js";
import { router } from './Routes/Router.js';
import hbs from 'hbs'
import path from 'path';
import { fileURLToPath } from 'url';
import flash from 'connect-flash';
import cors from 'cors'; 

dotenv.config();



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
// app.use(express.static(path.join(__dirname, 'src', 'assets'))); 
app.use(express.static(path.join(__dirname, 'Views', 'src', 'assets')));
app.use('/profile-images', express.static(path.join(__dirname, 'Views', 'src', 'ProfileImage')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Port = process.env.NODE_ENV === 'development' ? process.env.PORT || 2020 : 2024;

app.use(session({
  secret: process.env.SESSION_SECRET || 'rashu@123', // Use a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'development'} // Set secure to true if using HTTPS
}));

app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.errors = req.flash('error');
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
