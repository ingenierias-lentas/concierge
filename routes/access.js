const express = require('express')

const verifyAccessController = require('../controllers/verifyAccess');
const accessController = require('../controllers/access');

var router = express.Router()

router.post(
  '/signin',
  [
    verifyAccessController.verifyToken,
  ],
  accessController.signin
)

router.post(
  '/signup',
  accessController.signup
)

router.post(
  '/signout',
  [
    verifyAccessController.verifyToken,
  ],
  accessController.signout
)

module.exports = router
