// In this file you can configure migrate-mongo
// import { getURI, getDbConfig } from 'src/lib/db.js'
var path = require('path');
var fs = require('fs');
var logger = require('../src/lib/logger.js');
var dbConfig = {};
try {
  const dbConfigPath = path.resolve(path.join(__dirname, '../src/dbConfig.json'));
  dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'UTF-8'));
}
catch (err) {
  logger.error("Couldn't get dbConfig.json", err);
}
dbConfig = {
  username: process.env.MONGO_USER || dbConfig.username,
  password: process.env.MONGO_PASS || dbConfig.password,
  dbName: process.env.MONGO_DB_NAME || dbConfig.dbName,
  host: process.env.MONGO_HOST || dbConfig.host
}

const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbConfig.dbName}?retryWrites=true&w=majority`,

    // TODO Change this to your database name:
    databaseName: dbConfig.dbName,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js"
};

// Return the config as a promise
module.exports = config;
