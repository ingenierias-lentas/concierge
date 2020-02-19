const jwt = require('jsonwebtoken');

const roles = require('../models/roles');
const {db, tables} = require('../db');
const commonQueries = require('../db/commonQueries');

exports.checkRolesExist = async (req, res, next) => {
  try {
    let query1 = {
      text: `SELECT name FROM ${tables.roles}`,
      values: []
    };
    const res1 = await db.query(query1);

    for (let i=0; i<req.body.roles.length; i++) {
      let exists = false;
      res1.rows.forEach(r => {
        if (r.name == req.body.roles[i]) {
          exists = true;
        }
      });
      if (!exists) {
        res.status(400).send('Fail -> Does NOT exist role = ' + req.body.roles[i]);
        return;
      }
    }
    next();
  } catch(err) {
    console.log(err)
    res.status(500).send("Error checking if role exists -> " + err);
  }
}

exports.verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({
      auth: false,
      message: 'No token provided.'
    });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send({
        auth: false,
        message: 'Fail to authenticate. Error -> ' + err
      });
    } else if (req.body.username !== decoded.username) {
      return res.status(403).send({
        auth: false,
        message: 'Token provided does not match user.'
      });
    }
    next();
  });
}

exports.checkGroup = async (req, res, next) => {
  try {
    let validGroup = await commonQueries.isInGroup(req.body.username, req.body.groupname);
    if (!validGroup) {
      res.status(400).send('Fail -> Does NOT exist user = '
        + req.body.username + ' in group = '
        + req.body.groupname);
      return;
    }
    next();
  } catch (err) {
    res.status(500).send("Error verifying user in group -> " + err);
  }
}

exports.checkRole = async (req, res, next) => {
  try {
    let validRole = await commonQueries.isRole(req.body.username, req.body.groupname, req.body.rolename);
    if (!validRole) {
      res.status(403).send('Fail -> Require ' + req.body.rolename + 'role!');
      return;
    }
    next();
  } catch (err) {
    res.status(500).send(" Error verifying user role -> " + err);
  }
}

exports.isAdmin = async (req, res, next) => {
  try {
    let validRole = await commonQueries.isRole(req.body.username, req.body.groupname, roles.admin);
    if (!validRole) {
      res.status(403).send('Fail -> Must be admin!');
      return;
    }
    next();
  } catch (err) {
    console.log(err)
    res.status(500).send(" Error verifying admin role -> " + err);
  }
}
