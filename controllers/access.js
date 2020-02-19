const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const roles = require('../models/roles');
const groups = require('../models/groups');

const {db, tables} = require('../db');
const commonQueries = require('../db/commonQueries');

exports.signup = async (req, res) => {
  console.log('Processing func -> Sign-Up');

  try {
    let email_verified = false;
    let date_created = new Date();
    let last_login = new Date();
    let password_hash = bcrypt.hashSync(req.body.password, 8);

    let query1 = {
      text:
        `
        INSERT INTO ${tables.users}
          (username, email, email_verified, date_created, last_login, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
      values:
        [
          req.body.username,
          req.body.email,
          email_verified,
          date_created,
          last_login,
          password_hash
        ]
    };
    const res1 = await db.query(query1);

    let uid = await commonQueries.getUid(req.body.username);
    let gid = await commonQueries.getGid(groups.site);
    let rid = await commonQueries.getRid(roles.user);

    let query2 = {
      text:
        `
        INSERT INTO ${tables.group_users}
          (uid, gid)
        VALUES
          ($1, $2)
        `,
      values:
        [
          uid,
          gid
        ]
    };
    let res2 = await db.query(query2);

    let query3 = {
      text:
        `
        INSERT INTO ${tables.group_user_roles}
          (uid, gid, rid)
        VALUES
          ($1, $2, $3)
        `,
      values:
        [
          uid,
          gid,
          rid
        ]
    };
    let res3 = await db.query(query3)

    res.status(200).send("Signed up successfully");
  } catch (err) {
    console.log(err)
    res.status(500).send("Error in signup -> " + err);
  }
}

exports.signin = async (req, res) => {
  console.log('Processing func -> Sign-In');

  try {
    let query1 = {
      text:
        `
        SELECT u.uid, u.password
        FROM ${tables.users} u
        WHERE u.username = $1
        `,
      values: [req.body.username]
    };
    let res1 = await db.query(query1);

    if (!res1.rows) {
      return res.status(404).send('User Not Found.');
    }

    let passwordIsValid = bcrypt.compareSync(req.body.password, res1.rows[0].password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });
    }

    var token = jwt.sign({ username: req.body.username }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hrs
    });

    let last_login = new Date();

    let query2 = {
      text:
        `
        UPDATE ${tables.users}
        SET last_login = $1
        WHERE username = $2
        `,
      values:
        [
          last_login,
          req.body.username
        ]
    }

    res.status(200).send({ username: req.body.username, auth: true, accessToken: token });

  } catch (err) {
    res.status(500).send("Error in signin -> " + err);
  }
}

//TODO require user in request
exports.signout = async (req, res) => {
  res.status(200).json({
    "description": "Signout successful"
  });
}
