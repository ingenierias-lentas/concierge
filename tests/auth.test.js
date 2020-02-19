const request = require('supertest')

require('dotenv').config()
const app = require('../server')

const roles = require('../models/roles');
const groups = require('../models/groups');
const initUsers = require('../models/initUsers');

//TODO beforeAll() to reset test dbs

describe('Env', () => {
  it('should show test env', async() => {
    expect(process.env.NODE_ENV).toEqual('test')
  })
})

describe('SignUp', () => {
  it('should create a new user', async() => {
    const res = await request(app)
      .post('/access/signup')
      .send({
        username: 'testo',
        email: 'test@test.test',
        password: 'testt',
        roles: [roles.user]
      })
    expect.extend({
      signUpOrDuplicate(res, options) {
        if (res.statusCode == options.success.statusCode) {
          return {
            pass: res.text === options.success.text,
            message: () => `Route successful but received unexpected text ${res.text}`
          }
        } else if (res.statusCode == options.fail.statusCode) {
          return {
            pass: res.text.startsWith(options.fail.text),
            message: () => `500 fail for reason -> ${JSON.stringify(res.text)}`
          }
        } else {
          return {
            pass: false,
            message: () => `Unexpected failure mode -> ${JSON.stringify(res.text)}`
          }
        }
      }
    });

    expect(res).signUpOrDuplicate(
      {
        success: {
          statusCode: 200,
          text: 'Signed up successfully'
        },
        fail: {
          statusCode: 500,
          text: "Error in signup -> error: duplicate key value violates unique constraint"
        }
      }
    );
  })
})

describe('SignIn', () => {
  it('should sign in existing users', async() => {
    const usersItr = initUsers();
    for (const user of usersItr) {
      const res = await request(app)
        .post('/access/signin')
        .send({
          username: user.username,
          password: user.password,
        })
      expect(res.statusCode).toEqual(200);
    }
  });
})
