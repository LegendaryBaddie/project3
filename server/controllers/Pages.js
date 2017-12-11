const index = (req, res) => {
  if (!req.session.account) {
    return res.render('index', {
      csrfToken: req.csrfToken(),
    });
  }
  return res.render('index', {
    csrfToken: req.csrfToken(),
    account: req.session.account.username,
  });
};
const chat = (req, res) => {
  if (!req.session.account) {
    return res.render('index', {
      csrfToken: req.csrfToken(),
    });
  }
  return res.render('chat', {
    csrfToken: req.csrfToken(),
    account: req.session.account.username,
  });
};

module.exports.index = index;
module.exports.chat = chat;
