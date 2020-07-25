import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

function getDbConfig() {
  var dbConfig = {};
  try {
    const dbConfigPath = path.resolve(path.join(__dirname, '../dbConfig.json'));
    dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'UTF-8'));
  }
  catch (err) {
    console.error("Couldn't get dbConfig.json", err);
  }
  dbConfig = {
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
  return new Promise(async (resolve) => {
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

export { connectToDB, getURI }
export default connectToDB
