
/*
 * GET home page.
 */

exports.index = function(req, res){
  connection.query("SELECT * from hotpam");
  res.render('index', { title: 'Express' });
};