const models = require('../models');

const { Account } = models;

const signupPage = (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
};
const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.password}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(400).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);
    // redirect to current button creation/ownership page
    return res.json({ redirect: '/chat' });
  });
};

const checkAccount = (req, res) => {
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'No Account' });
    }
    if (doc) {
      if (doc.premium) {
        return res.render('account', {
          account: req.session.account.username,
          csrfToken: req.csrfToken(),
          merits: doc.merits,
          premium: 0,
        });
      }
      return res.render('account', {
        account: req.session.account.username,
        csrfToken: req.csrfToken(),
        merits: doc.merits,
      });
    }
    return res.status(400).json({ error: 'No Account' });
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    newAccount.save((err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occured' });
      }

      req.session.account = Account.AccountModel.toAPI(newAccount);
      //
      return res.json({ redirect: '/chat' });
    });
  });
};
const checkMerits = (account) => {
  Account.AccountModel.findByUsername(account, (err, doc) => {
    if (err) {
      console.log(`error in updateMerit: ${err}`);
      return null;
    }
    if (!doc) {
      console.log('no account found');
      return null;
    }
    return doc.merits;
  });
};
const updateMerits = (account, meritInc) => {
  Account.AccountModel.findByUsername(account, (err, doc) => {
    if (err) {
      console.log(`error in updateMerit: ${err}`);
      return;
    }
    if (!doc) {
      console.log('no account found');
      return;
    }
    const acc = doc;
    // if the transaction would make the merits negative
    if (acc.merits + meritInc < 0) {
      return;
    }
    // increase merits by the amount they had on the message;
    acc.merits += meritInc;
    // save the data back to the database
    acc.save((er) => {
      if (er) {
        console.log(er);
      }
    });
  });
};

module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.signupPage = signupPage;
module.exports.updateMerits = updateMerits;
module.exports.checkMerits = checkMerits;
module.exports.checkAccount = checkAccount;
