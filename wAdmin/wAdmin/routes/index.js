/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Welcome to GNAS Admin System' });
};
