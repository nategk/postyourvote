import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

async function connectToDB() {
  return new Promise(async (resolve) => {
    let dbConfig;
    try {
      const dbConfigPath = path.resolve(path.join(__dirname, '../dbConfig.json'));
      dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'UTF-8'));
    }
    catch (err) {
      console.error("Couldn't get dbConfig.json", err);
      dbConfig = {}
    }
    const username = process.env.MONGO_USER || dbConfig.username;
    const password = process.env.MONGO_PASS || dbConfig.password;
    const dbName = process.env.MONGO_DB_NAME || dbConfig.dbName;
    const host = process.env.MONGO_HOST || dbConfig.host;
    const uri = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      if (err) {
        console.error("Couldn't connect to DB", err);
        resolve(err);
      } else {
        console.log("Connected to the DB");
        // const collection = client.db("voteremote").collection("postalcodes");
        resolve(client);
      }
    });
  });
}

export default connectToDB
