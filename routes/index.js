module.exports = function(app, db, isLoggedIn) {
  app.get('/', function (req, res) {
    res.render('index', {
      pageType: 'index'
    });
  });

  app.get('/dashboard', isLoggedIn, function (req, res) {
    res.render('dashboard', {
      pageType: 'dashboard'
    });
  });
};
