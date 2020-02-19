const request = require('supertest')

require('dotenv').config()
const app = require('../server')

const roles = require('../models/roles');
const groups = require('../models/groups');
const initUsers = require('../models/initUsers');

let user = {
  username: process.env.SITE_ADMIN,
  password: process.env.SITE_ADMIN_PASSWORD,
  groupname: groups.site,
}
let accessToken;
beforeAll(() => {
  return request(app)
    .post('/access/signin')
    .send({
      username: user.username,
      password: user.password,
    }).then( res => {
      accessToken = res.body.accessToken;
    });
});

describe('New Command', () => {
  it('should register new command', async() => {
    const res = await request(app)
      .post('/command/newcommand')
      .send({
        username: user.username,
        groupname: groups.site,
        commandName: 'test',
        runCommand: 'ls /',
        killCommand: '',
      })
      .set('authorization', 'Bearer ' + accessToken)
    expect(res.statusCode).toEqual(200);
  })
})
