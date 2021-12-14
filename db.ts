import mariadb = require('mariadb');

// connection pool
var pool =
  mariadb.createPool({
    "host": "gifdb.ccw1pma4egwk.us-east-1.rds.amazonaws.com",
    "port": 3306,
    "user": "levi",
    "password": "",
    "database": "gifAPI"
  });

export { pool }