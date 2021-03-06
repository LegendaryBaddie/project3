const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/chat', mid.requiresSecure, mid.requiresLogin, controllers.Pages.chat);
  app.get('/', mid.requiresSecure, controllers.Pages.index);
  app.get('/index', mid.requiresSecure, controllers.Pages.index);
  app.get('/account', mid.requiresSecure, mid.requiresLogin, controllers.Account.checkAccount);
};

module.exports = router;
