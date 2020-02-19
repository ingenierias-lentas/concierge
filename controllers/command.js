const exec = require('child_process').exec;

const roles = require('../models/roles');
const {db, tables} = require('../db');
const commonQueries = require('../db/commonQueries');

exports.newCommand = async (req, res) => {
  console.log('Processing func -> New command');

  try {
    let creatorUid = await commonQueries.getUid(req.body.username);
    let dateCreated = new Date();
    let query1 = {
      text:
        `
        INSERT INTO ${tables.registered_processes}
          (creator_uid, name, run_command, kill_command, date_created)
        VALUES ($1, $2, $3, $4, $5)
        `,
      values:
        [
          creatorUid,
          req.body.commandName,
          req.body.runCommand,
          req.body.killCommand,
          dateCreated
        ]
    };
    let res1 = await db.query(query1);
    
    let creatorGid = await commonQueries.getGid(req.body.groupname);
    let rid = await commonQueries.getRid(roles.admin);
    let rpid = await commonQueries.getRpid(req.body.commandName);
    let permissionLevel = 'B111';
    let query2 = {
      text:
        `
        INSERT INTO ${tables.registered_process_permissions}
          (rpid, gid, rid, rwx)
        VALUES ($1, $2, $3, $4)
        `,
      values:
        [
          rpid,
          creatorGid,
          rid,
          permissionLevel
        ]
    };
    let res2 = await db.query(query2);

    res.status(200).json({
      "description": "Command created successfully"
    });
  } catch(err) {
    console.log(err)
    res.status(500).send("Error creating new command -> " + err);
  }
}

exports.deleteCommand = async (req, res) => {
  console.log('Processing func -> Delete command');

  try {
    let rpid = await commonQueries.getRpid(req.body.processName);
    
    // Delete all entries from registered_process_permissions table
    let query1 = {
      text: 
        `
        DELETE FROM ${tables.registered_process_permissions}
        WHERE ${tables.registered_process_permissions}.rpid = $1
        `,
      values:
        [
          rpid
        ]
    }
    let res1 = await db.query(query1);

    // Delete entry from registered_processes table
    let query2 = {
      text:
        `
        DELETE FROM ${tables.registered_processes}
        WHERE ${tables.registered_processes}.rpid = $1
        `,
      values:
        [
          rpid
        ]
    }
    let res2 = await db.query(query2);

    res.status(200).json({
      "description": "Command deleted successfully"
    });
  } catch(err) {
    res.status(500).send("Error deleting command -> " + err);
  }
}

//TODO add child id to running_processes database
exports.runCommand = async (req, res) => {
  console.log('Processing func -> Run command');

  try {
    let query1 = {
      text:
        `
        SELECT rp.run_command
        FROM ${tables.registered_processes} rp
        WHERE r.name = $1
        `,
      values:
        [
          req.body.processName
        ]
    };
    let res1 = await db.query(query1);
    const child = exec(res1.row[0].runCommand,
      (err, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (err != null) {
          console.log(`exec error: ${err}`);
          res.status(500).send("Error executing run command -> " + err);
        }
    })
    console.log(child);

    res.status(200).json({
      "description": "Command run successfully"
    });
  } catch(err) {
    res.status(500).send("Error running command -> " + err);
  }
}

//TODO remove child id from running_processes database
exports.killCommand = async (req, res) => {
  console.log('Processing func -> Kill command');

  try {
    let query1 = {
      text:
        `
        SELECT rp.kill_command
        FROM ${tables.registered_processes} rp
        WHERE r.name = $1
        `,
      values:
        [
          req.body.processName
        ]
    };
    let res1 = await db.query(query1);
    const child = exec(res1.row[0].killCommand,
      (err, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (error != null) {
          console.log(`exec error: ${err}`);
          res.status(500).send("Error executing kill command -> " + err);
        }
    })

    res.status(200).json({
      "description": "Command killed successfully"
    });
  } catch(err) {
    res.status(500).send("Error killing command -> " + err);
  }
}
