
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
// var mysql = require('mysql');
var pg = require('pg');
var app = express();


var pg_url = process.env.DATABASE_URL || 'postgresql://localhost/test';
console.log(pg_url);
var client = new pg.Client(pg_url);
client.connect(function(err){
  if(err){
    console.log(err);
  }
  client.query("SELECT * from hotmap", function(err, result){
    if(err){
      console.log(err);
    }
    console.log(result.rows);
  });
});
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   port     : 3306,
//   user     : 'root',
//   password : '',
//   database : 'test'
// });

// connection.query('USE test_database');

// connection.connect(function(err){
//         if(err !== null) {
//             console.log('Error connecting to mysql:' + err+'\n');
//         }
//       });


// createTable = "CREATE table hotmap (latitude decimal(10, 8) NOT NULL, longitude decimal(11, 8) NOT NULL, rating tinyint, deciveID varchar(100), created TIMESTAMP DEFAULT NOW());"

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
  client.query("SELECT * from hotmap", function(err, result){
    res.render('index', {title: 'hotmap', data: result.rows});
  });
});

app.get('/new', function(req, res){
  res.render('new');
});

app.post('/new', function(req, res){
  // console.log(req.body);
  var query = "INSERT INTO hotmap(latitude, longitude, " +
                    "rating, deviceID) VALUES(" + req.body.latitude +
                    ', ' + req.body.longitude + ', ' + req.body.rating +
                    ", 'computer')";
  console.log(query);
  client.query(query, function(err, results){
    if(err !== null){
      console.log("ERROR: " + err);
    } else {
      res.render('success');
    }
  });
});

app.get('/all', function(req, res){
  client.query("SELECT * from hotmap", function(err, result){
    res.json(result.rows);
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
  client.query(query, function(err, results){
    if(err !== null){
      // ERROR HANDLING HERE
      console.log(err);
    } else {
      res.json(results.rows);
    }
  });
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
