import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import Airtable from 'airtable';

var dbConfig = {};

function getDbConfig() {
  if (Object.keys(dbConfig).length) {
    return dbConfig;
  }
  try {
    const dbConfigPath = path.resolve(path.join(__dirname, '../dbConfig.json'));
    dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'UTF-8'));
  }
  catch (err) {
    console.warn("Couldn't get dbConfig.json");
  }
  dbConfig = {
    airtableKey: process.env.AIRTABLE_KEY || dbConfig.airtableKey,
    airtableBaseName: process.env.AIRTABLE_BASE_NAME || dbConfig.airtableBaseName,
    username: process.env.MONGO_USER || dbConfig.username,
    password: process.env.MONGO_PASS || dbConfig.password,
    dbName: process.env.MONGO_DB_NAME || dbConfig.dbName,
    host: process.env.MONGO_HOST || dbConfig.host
  }
  // TODO: check if any are undefined
  return dbConfig;
}

function getURI() {
  const { username, password, dbName, host } = getDbConfig();
  const uri = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
  return uri;
}

async function connectToDB() {
  return new Promise((resolve) => {
    const uri = getURI();
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      if (err) {
        console.error("Couldn't connect to DB", err);
        resolve(err);
      } else {
        console.log("Connected to the DB");
        resolve(client);
      }
    });
  });
}

function connectToAirtable() {
  const { airtableKey, airtableBaseName } = getDbConfig();
  var base = new Airtable({apiKey: airtableKey}).base(airtableBaseName);
  return base;
}

export { connectToDB, getURI, connectToAirtable }
export default connectToDB
