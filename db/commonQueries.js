const permissions = require('../models/permissions');
const {db, tables} = require('./index');

// Don't perform error handling here.
// Errors is handled in routing middleware or endpoints

const getUid = async(username) => {
  let query = {
    text:
      `
      SELECT u.uid
      FROM ${tables.users} u
      WHERE u.username = $1
      `,
    values: 
      [
        username
      ]
  };
  let res = await db.query(query);

  return res.rows[0].uid
}

const getGid = async(groupname) => {
  let query = {
    text:
      `
      SELECT g.gid
      FROM ${tables.groups} g
      WHERE g.name = $1
      `,
    values:
      [
        groupname
      ]
  };
  let res = await db.query(query);

  return res.rows[0].gid
}

const getRid = async(rolename) => {
  let query = {
    text:
      `
      SELECT r.rid
      FROM ${tables.roles} r
      WHERE r.name = $1
      `,
    values:
      [
        rolename
      ]
  };
  let res = await db.query(query);

  return res.rows[0].rid;
}

const getRpid = async(processname) => {
  let query = {
    text:
      `
      SELECT rp.rpid
      FROM ${tables.registered_processes} rp
      WHERE rp.name = $1
      `,
    values:
      [
        processname
      ]
  };
  let res = await db.query(query);

  return res.rows[0].rpid;
}

const isInGroup = async (username, groupname) => {
  let uid = await getUid(username);
  let gid = await getGid(groupname);

  let query1 = {
    text:
      `
      SELECT u.uid
      FROM ${tables.group_users} gu
      INNER JOIN ${tables.users} u ON u.uid = gu.uid
      WHERE gu.uid = $1 AND gu.gid = $2
      `,
    values:
      [
        uid,
        gid
      ]
  };
  const res1 = await db.query(query1);
  return (res1.rows[0].uid === uid);
}

const isRole = async (username, groupname, rolename) => {
  let uid = await getUid(username);
  let gid = await getGid(groupname);
  let query1 = {
    text:
      `
      SELECT r.name
      FROM ${tables.group_user_roles} gur
      INNER JOIN ${tables.roles} r ON r.rid = gur.rid
      WHERE gur.uid = $1 AND gur.gid = $2
      `,
    values:
      [
        uid,
        gid,
      ]
  };
  const res1 = await db.query(query1);

  let exists = false;
  res1.rows.forEach(r => {
    if (r.name === rolename) {
      exists = true;
    }
  });
  return exists;
}

const hasPermission = async (username, groupname, rolename, processname, permission) => {
  let validUser = await isRole(username, groupname, rolename);
  if (!validUser) return false;

  let gid = await getGid(groupname);
  let rid = await getRid(rolename);
  let rpid = await getRpid(processname);
  let query1 = {
    text:
      `
      SELECT rp.rwx
      FROM ${tables.registered_processes} rp
      WHERE rp.rpid = $1 AND rp.gid = $2 and rp.rid = $3
      `,
    values:
      [
        rpid,
        gid,
        rid,
      ]
  }
  const res1 = await db.query(query1);
  console.log(res1.rows[0]);

  let re = permissions.re[permission];
  return re.test(res1.rows[0].rwx);
}

module.exports = {
  getUid : getUid,
  getGid : getGid,
  getRid : getRid,
  getRpid : getRpid,
  isInGroup : isInGroup,
  isRole : isRole,
  hasPermission : hasPermission,
};
