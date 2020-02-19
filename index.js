// Use process.env
require('dotenv').config()

const {seeds} = require('./db');

if (process.env.RESET == 'true') {
  // Use IIFE so that await can be used
  (async () => {
    console.log('Resetting db tables');
    // Drop current db tables
    await seeds.drop_group_user_roles_table();
    await seeds.drop_group_users_table();
    await seeds.drop_users_table();
    await seeds.drop_roles_table();
    await seeds.drop_groups_table();
    await seeds.drop_registered_processes();
    await seeds.drop_registered_process_permissions();
    await seeds.drop_running_processes();

    // Create db tables
    await seeds.create_users_table();
    await seeds.create_roles_table();
    await seeds.create_groups_table();
    await seeds.create_group_users_table();
    await seeds.create_group_user_roles_table();
    await seeds.create_registered_processes();
    await seeds.create_registered_process_permissions();
    await seeds.create_running_processes();

    // Insert initial data
    await seeds.seed_users_table();
    await seeds.seed_roles_table();
    await seeds.seed_groups_table();
    await seeds.seed_group_users_table();
    await seeds.seed_group_user_roles_table();
    await seeds.seed_registered_processes();
    await seeds.seed_registered_process_permissions();
    await seeds.seed_running_processes();
  })();
}

const server = require('./server');

const PORT = process.env.PORT || 8021;

server.listen(PORT, function () {
  console.log('Listening at ' + PORT);
})
