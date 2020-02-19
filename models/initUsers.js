const roles = require('./roles');
const groups = require('./groups');

function* usersItr() {
  yield {
    username: process.env.SITE_ADMIN,
    email: process.env.SITE_ADMIN_EMAIL,
    password: process.env.SITE_ADMIN_PASSWORD,
    roles: [{group: groups.site, role: roles.admin}]
  };

  if (process.env.NODE_ENV === 'test') {
    yield {
      username: 'test1',
      email: 'test1@test.com',
      password: 'test1test1test1',
      roles: [{group: groups.site, role: roles.user}]
    };
  }
}

module.exports = usersItr;
