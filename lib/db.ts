// tslint:disable-next-line:no-require-imports
import Mongo = require("mongodb");
import { IMessageData } from "./crawler";

const dbHost = "localhost";
const DB_CREDS = "";
const dbName = "db";
const dbUrl = `mongodb://${DB_CREDS}${dbHost}:27017/${dbName}`;

const dbCollection = "channels";
const dbClient = new Mongo.MongoClient(dbUrl);

let client: Mongo.MongoClient;
let initFailed = false;

async function initialize(): Promise<Mongo.MongoClient> {
    return new Promise<Mongo.MongoClient>( (resolve, reject) => {
        dbClient.connect()
            .then( (d) => {
                client = d;
                resolve(d);
          })
          .catch( (err) => {
              reject(err);
              initFailed = true;
          });
    });
}

async function find() {
    if (client == null) {
        await initialize();
    }
}

export async function insertMessageData(data: IMessageData[]): Promise<void> {
    console.log("Inserting MessagesPage", data);
    if (initFailed) {
        console.error("Init failed");
        return;
    }
    else if (client == null) {
        await initialize();
    }

    await client.db().collection(dbCollection).insertMany(data);
    console.log(`Inserted ${data.length} messages`);
}
