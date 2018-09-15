// Load the dotfiles.
require('dotenv').load({silent: true});

var express         = require('express');

// Middleware!
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');
const path = require('path');
//const uploader = require('./app/server/services/upload.js');
const multer = require('multer');
var uploader = multer({ dest: 'uploads/' })

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
var database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

var settingsConfig  = require('./config/settings');
var adminConfig     = require('./config/admin');

var app             = express();

// Connect to mongodb
mongoose.connect(database);

app.use(morgan('dev'));

app.post('/api/users/:id/resume-drop', uploader.any(), function(req, res){
    var id = req.params.id;

    console.log(req.fileAccepted)
    console.log(req.body)
    console.log(req.file)
    console.log(req.files)

    return res.status(269).send({message: "Your error has been recorded, we'll get right on it!"});
});

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '2mb'
}));
app.use(bodyParser.json({limit: '2mb'}));

app.use(methodOverride());

app.use(express.static(__dirname + '/app/client'));

// Routers =====================================================================

var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use('/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use('/auth', authRouter);

require('./app/server/routes')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

