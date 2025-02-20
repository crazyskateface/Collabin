const express = require('express');
const http = require('http');

const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/authMiddleware');
const app = express();
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', __dirname + '/views');

// Serve static files
app.use(express.static(__dirname + '/../public'));

// Middleware for sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware for body parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Use the authentication middleware
app.use(authMiddleware);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Define routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

app.get('/collab', (req, res) => {
  res.render('collab', { title: 'Collaboration' });
});

// Use authentication routes
const authRoutes = require('./routes/auth');
app.use(authRoutes);

const executeRoutes = require('./routes/execute');
app.use(executeRoutes);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // real-time collaboration events
  socket.on('codeChange', (data) => {
    console.log('codeChange', data);
    socket.broadcast.emit('codeChange', data);
  });
});



// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
