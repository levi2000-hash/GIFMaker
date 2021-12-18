import mariadb from 'mariadb';


// connection pool
let pool =
 mariadb.createPool({
    "host": "gifmaker-db.cpeyupjlli4d.us-east-1.rds.amazonaws.com",
    "port": 3306,
    "user": "gifapi",
    "password": "fOyH81b5QV8vMxEkByL1",
    "database": "gifmakerdb"
  });

export function getPool()
{
  return pool
}