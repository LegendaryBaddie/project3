const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) =>{
    app.get('/',  controllers.Pages.index);
};

module.exports = router;