const index = (req, res) => {
  res.render('index', {
    csrfToken: req.csrfToken()
  });
};

module.exports.index = index;
