const {db, tables} = require('../db');
const commonQueries = require('../db/commonQueries');
const permissions = require('../models/permissions');

exports.canExecute = async (req, res) => {
  try {
    let canExecute = await commonQueries.hasPermission(
      req.body.username, req.body.groupname, req.body.processname, permissions.names.x
    );
    if (!canExecute) {
      res.status(403).send("User does not have execute permission");
    }
    next()
  } catch(err) {
    res.status(500).send("Error checking if requester can execute command -> " + err);
  }
}

exports.canWrite = async (req, res) => {
  try {
    let canWrite = await commonQueries.hasPermission(
      req.body.username, req.body.groupname, req.body.processname, permissions.names.w
    );
    if (!canWrite) {
      res.status(403).send("User does not have write permission");
    }
    next()
  } catch(err) {
    res.status(500).send("Error checking if requester can write command -> " + err);
  }
}

exports.canRead = async (req, res) => {
  try {
    let canRead = await commonQueries.hasPermission(
      req.body.username, req.body.groupname, req.body.processname, permissions.names.r
    );
    if (!canRead) {
      res.status(403).send("User does not have read permission");
    }
    next()
  } catch(err) {
    res.status(500).send("Error checking if requester can read command -> " + err);
  }
}
