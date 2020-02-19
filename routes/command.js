var express = require('express')

const verifyAccessController = require('../controllers/verifyAccess');
const verifyCommandController = require('../controllers/verifyCommand');
const commandController = require('../controllers/command');

var router = express.Router()

router.post(
  '/newcommand',
  [
    verifyAccessController.verifyToken,
    verifyAccessController.checkGroup,
    verifyAccessController.isAdmin,
  ],
  commandController.newCommand
)

router.post(
  'deletecommand',
  [
    verifyAccessController.verifyToken,
    verifyAccessController.checkGroup,
    verifyCommandController.canWrite,
  ],
  commandController.deleteCommand
)

router.post(
  'runcommand',
  [
    verifyAccessController.verifyToken,
    verifyAccessController.checkGroup,
    verifyCommandController.canExecute,
  ],
  commandController.runCommand
)

router.post(
  'killcommand',
  [
    verifyAccessController.verifyToken,
    verifyAccessController.checkGroup,
    verifyCommandController.canExecute,
  ],
  commandController.killCommand
)

module.exports = router
