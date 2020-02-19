const bcrypt = require('bcryptjs');

const { Pool } = require('pg')
const roles = require('../models/roles');
const groups = require('../models/groups');
const initUsers = require('../models/initUsers');

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

var tables;
if (process.env.NODE_ENV === 'test') {
  tables = {
    users: 'testusers',
    roles: 'testroles',
    groups: 'testgroups',
    group_users: 'test_group_users',
    group_user_roles: 'test_group_user_roles',
    registered_processes: 'test_registered_processes',
    registered_process_permissions: 'test_registered_process_permissions',
    running_processes: 'test_running_processes',
  }
} else {
  tables = {
    users: 'users',
    roles: 'roles',
    groups: 'groups',
    group_users: 'group_users',
    group_user_roles: 'group_user_roles',
    registered_processes: 'registered_processes',
    registered_process_permissions: 'registered_process_permissions',
    running_processes: 'running_processes',
  }
}

const seeds = {
  create_users_table : async () => {
    try{
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.users} (
          uid SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE,
          email VARCHAR(255) UNIQUE,
          email_verified BOOLEAN,
          date_created TIMESTAMPTZ,
          last_login TIMESTAMPTZ,
          password VARCHAR(255) NOT NULL
        )
        `
      );
    } catch (err) {
      console.log('Error in users db creation -> ' + err);
    }
  },
  drop_users_table : async () => {
    try{
      await db.query(`DROP TABLE IF EXISTS ${tables.users}`);
    } catch (err) {
      console.log('Error in users db drop -> ' + err);
    }
  },
  seed_users_table : async () => {
    try {
      const usersItr = initUsers();
      for (const user of usersItr) { 
        let email_verified = false;
        let date_created = new Date();
        let last_login = new Date();
        let password_hash = bcrypt.hashSync(user.password, 8);

        let query1 = {
          text: 
          `
          INSERT INTO ${tables.users} (
            username, email, email_verified, date_created, last_login, password
          ) VALUES ($1, $2, $3, $4, $5, $6)
          `,
          values:
          [
            user.username,
            user.email,
            email_verified,
            date_created,
            last_login,
            password_hash
          ]
        }
        await db.query(query1);
      }
    } catch (err) {
      console.log('Error in users db seed -> ' + err);
    }
  },
  create_roles_table : async () => {
    try{
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.roles} (
          rid SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE
        )
        `
      );
    } catch (err) {
      console.log('Error in roles db creation -> ' + err);
    }
  },
  drop_roles_table : async () => {
    try{
      await db.query(`DROP TABLE IF EXISTS ${tables.roles}`);
    } catch (err) {
      console.log('Error in roles db drop -> ' + err);
    }
  },
  seed_roles_table : async () => {
    try{
      for (r in roles) {
        await db.query(
          `
          INSERT INTO ${tables.roles} (name)
          VALUES ('${roles[r]}')
          `
        );
      }
    } catch (err) {
      console.log('Error in roles db seed -> ' + err);
    }
  },
  create_groups_table : async () => {
    try {
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.groups} (
          gid SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE
        )
        `
      )
    } catch (err) {
      console.log('Error in groups db creation -> ' + err);
    }
  },
  drop_groups_table : async () => {
    try {
      await db.query(`DROP TABLE IF EXISTS ${tables.groups}`);
    } catch (err) {
      console.log('Error in groups db drop => ' + err);
    }
  },
  seed_groups_table : async () => {
    try {
      for (g in groups) {
        await db.query (
          `
          INSERT INTO ${tables.groups} (name)
          VALUES ('${groups[g]}')
          `
        )
      }
    } catch (err) {
      console.log('Error in groups db seed => ' + err);
    }
  },
  create_group_users_table : async () => {
    try{
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.group_users} (
          uid SERIAL NOT NULL,
          gid SERIAL NOT NULL,
          FOREIGN KEY (uid) REFERENCES ${tables.users} (uid),
          FOREIGN KEY (gid) REFERENCES ${tables.groups} (gid)
        );
        `
      );
    } catch (err) {
      console.log('Error in group_users db creation -> ' + err);
    }
  },
  drop_group_users_table : async () => {
    try{
      await db.query(`DROP TABLE IF EXISTS ${tables.group_users}`);
    } catch (err) {
      console.log('Error in group_users db drop -> ' + err);
    }
  },
  seed_group_users_table : async () => {
    try {
      const usersItr = initUsers();
      for (const user of usersItr) { 
        let query1 = {
          text:
            `
            SELECT u.uid
            FROM ${tables.users} u
            WHERE u.username = $1
            `,
          values: 
            [
              user.username
            ]
        };
        let res1 = await db.query(query1);

        for (el in user.roles) {
          let role = user.roles[el];
          let query2 = {
            text:
              `
              SELECT g.gid
              FROM ${tables.groups} g
              WHERE g.name = $1
              `,
            values: 
              [
                role.group
              ]
          };
          let res2 = await db.query(query2);

          let query3 = {
            text:
              `
              INSERT INTO ${tables.group_users}
                (uid, gid)
              VALUES
                ($1, $2)
              `,
            values:
              [
                res1.rows[0].uid,
                res2.rows[0].gid
              ]
          };
          let res3 = await db.query(query3);
        }
      }
    } catch (err) {
      console.log('Error in group_users db seed -> ' + err)
    }
  },
  create_group_user_roles_table : async () => {
    try{
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.group_user_roles} (
          uid SERIAL NOT NULL,
          gid SERIAL NOT NULL,
          rid SERIAL NOT NULL,
          FOREIGN KEY (uid) REFERENCES ${tables.users} (uid),
          FOREIGN KEY (gid) REFERENCES ${tables.groups} (gid),
          FOREIGN KEY (rid) REFERENCES ${tables.roles} (rid)
        );
        `
      );
    } catch (err) {
      console.log('Error in group_user_roles db creation -> ' + err);
    }
  },
  drop_group_user_roles_table : async () => {
    try{
      await db.query(`DROP TABLE IF EXISTS ${tables.group_user_roles}`);
    } catch (err) {
      console.log('Error in group_user_roles db drop -> ' + err);
    }
  },
  seed_group_user_roles_table : async () => {
    try {
      const usersItr = initUsers();
      for (const user of usersItr) { 
        let query1 = {
          text:
            `
            SELECT u.uid
            FROM ${tables.users} u
            WHERE u.username = $1
            `,
          values: 
            [
              user.username
            ]
        };
        let res1 = await db.query(query1);

        for (el in user.roles) {
          role = user.roles[el];
          let query2 = {
            text:
              `
              SELECT g.gid
              FROM ${tables.groups} g
              WHERE g.name = $1
              `,
            values: 
              [
                role.group
              ]
          };
          let res2 = await db.query(query2);

          let query3 = {
            text:
              `
              SELECT r.rid
              FROM ${tables.roles} r
              WHERE r.name = $1
              `,
            values: 
              [
                role.role
              ]
          };
          let res3 = await db.query(query3);

          let query4 = {
            text:
              `
              INSERT INTO ${tables.group_user_roles}
                (uid, gid, rid)
              VALUES
                ($1, $2, $3)
              `,
            values:
              [
                res1.rows[0].uid,
                res2.rows[0].gid,
                res3.rows[0].rid
              ]

          };
          let res4 = await db.query(query4);
        }
      }
    } catch (err) {
      console.log('Error in group_user_roles db seed -> ' + err)
    }
  },
  create_registered_processes_table : async() => {
    try {
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.registered_processes} (
          rpid SERIAL PRIMARY KEY,
          creator_uid SERIAL NOT NULL,
          name VARCHAR(255) UNIQUE,
          run_command VARCHAR(255),
          kill_command VARCHAR(255),
          date_created TIMESTAMPTZ,
          FOREIGN KEY (creator_uid) REFERENCES ${tables.users} (uid)
        );
        `
      );
    } catch (err) {
      console.log('Error in registered_processes table create -> ' + err)
    }
  },
  drop_registered_processes_table : async() => {
    try {
      await db.query(`DROP TABLE IF EXISTS ${tables.registered_processes}`);
    } catch (err) {
      console.log('Error in registered_processes table drop -> ' + err)
    }
  },
  seed_registered_processes_table : async() => {
    try {
    } catch (err) {
      console.log('Error in registered_processes table seed -> ' + err)
    }
  },
  create_registered_process_permissions_table : async() => {
    try {
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.registered_process_permissions} (
          rpid SERIAL NOT NULL,
          gid SERIAL NOT NULL,
          rid SERIAL NOT NULL,
          rwx BIT(3),
          FOREIGN KEY (rpid) REFERENCES ${tables.registered_processes} (rpid),
          FOREIGN KEY (gid) REFERENCES ${tables.groups} (gid),
          FOREIGN KEY (rid) REFERENCES ${tables.roles} (rid)
        );
        `
      );
    } catch (err) {
      console.log('Error in registered_process_permissions table create -> ' + err)
    }
  },
  drop_registered_process_permissions_table : async() => {
    try {
      await db.query(`DROP TABLE IF EXISTS ${tables.registered_process_permissions}`);
    } catch (err) {
      console.log('Error in registered_process_permissions table drop -> ' + err)
    }
  },
  seed_registered_process_permissions_table : async() => {
    try {
    } catch (err) {
      console.log('Error in registered_process_permissions table seed -> ' + err)
    }
  },
  create_running_processes_table : async() => {
    try {
      await db.query(
        `
        CREATE TABLE IF NOT EXISTS ${tables.running_processes} (
          pid BIGINT NOT NULL,
          runner_uid SERIAL NOT NULL,
          gid SERIAL NOT NULL,
          rpid SERIAL NOT NULL,
          FOREIGN KEY (runner_uid) REFERENCES ${tables.users} (uid),
          FOREIGN KEY (gid) REFERENCES ${tables.groups} (gid),
          FOREIGN KEY (rpid) REFERENCES ${tables.registered_processes} (rpid)
        );
        `
      );
    } catch (err) {
      console.log('Error in running_processes table create -> ' + err)
    }
  },
  drop_running_processes_table : async() => {
    try {
      await db.query(`DROP TABLE IF EXISTS ${tables.running_processes}`);
    } catch (err) {
      console.log('Error in running_processes table drop -> ' + err)
    }
  },
  seed_running_processes_table : async() => {
    try {
    } catch (err) {
      console.log('Error in running_processes table seed -> ' + err)
    }
  },
}

const dbConfig = {}
dbConfig.db = db;
dbConfig.tables = tables;
dbConfig.seeds = seeds;

module.exports = dbConfig;
