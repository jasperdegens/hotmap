
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : '',
  database : 'test'
});

// connection.query('USE test_database');

connection.connect(function(err){
        if(err !== null) {
            console.log('Error connecting to mysql:' + err+'\n');
        }
      });




// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
app.get('/',  function(req, res){
  connection.query("SELECT * from hotmap", function(err, rows){
    res.render('index', {title: 'hotmap', data: rows});
  });
});

app.get('/new', function(req, res){
  res.render('new');
});


app.post('/new', function(req, res){
  // console.log(req.body);
  var query = "INSERT INTO hotmap(latitude, longitude, " +
                    "rating, deviceID) VALUES(" + req.body.lat +
                    ',' + req.body.long + ',' + req.body.rating +
                    ',"computer")';
  console.log(query);
  connection.query(query, function(err, results){
    if(err !== null){
      console.log("ERROR" + err);
    } else {
      res.render('success');
    }
  });
});

app.get('/all', function(req, res){
  connection.query("SELECT * from hotmap", function(err, rows){
    res.json(rows);
  });
});

app.get('/nearby', function(req, res){
  var params = req.query;
  console.log(params);
  var latitude = parseFloat(params.latitude);
  var longitude = parseFloat(params.longitude);

  var query = 'SELECT * from hotmap WHERE (latitude BETWEEN ' + (latitude - 1) + ' AND ' +
                (latitude + 1) + ') AND (longitude BETWEEN ' + (longitude - 1) + ' AND ' +
                (longitude + 1) + ')';
  console.log(query);
  connection.query(query, function(err, results){
    if(err !== null){
      // ERROR HANDLING HERE
      console.log(err);
    } else {
      res.json(results);
    }
  });
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
