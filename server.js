const PORT = process.env.PORT || 3000;
const db = "mongodb://theo:theo@ds143588.mlab.com:43588/heroku_c1bv7qr3";
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let dotenv = require('dotenv');
let router = require('./routes/api');
dotenv.config({ verbose: true });

mongoose.connect(db, (err) => {
    if(err) {
        console.log(err)
    }
});

mongoose.connection.on('connected', () => console.log('Mongoose has connected to ' + db));

mongoose.connection.on('disconnected', () => console.log('Mongoose has disconnected from ' + db));

mongoose.connection.on('error', () => console.log('An error has occured connecting to ' + db));

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

app.use('/api', router);

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('*', (request, response) => {
    response.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));