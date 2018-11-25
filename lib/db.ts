// tslint:disable-next-line:no-require-imports
import Mongo = require("mongodb");
import { IMessageData, IChannel, IUser } from "./crawler";

const dbHost = "localhost";
const DB_CREDS = "";
const dbName = "db";
const dbUrl = `mongodb://${DB_CREDS}${dbHost}:27017/${dbName}`;

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

async function isDbGood(): Promise<boolean> {
    if (initFailed) {
        console.error("Init failed");
        return false;
    }
    else if (client == null) {
        await initialize();
    }
    return client != null;
}

const COLLECTION_CHANNELS = "channels";
const COLLECTION_MSGS = "messages";
const COLLECTION_USERS = "users";

export async function insertChannels(channels: IChannel[]): Promise<void> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_CHANNELS).insertMany(channels);
    console.log(`Inserted ${result.insertedCount} channels`);
}

export async function findChannel(channelID: string): Promise<IChannel> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_CHANNELS).findOne({ id: channelID });
    console.log("Channel with ID " + channelID, result);
}

export async function findChannelTotals(): Promise<any> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection('messages').aggregate([
        { 
            "$group" : 
            {_id:"$channelID", count:{$sum:1}}
        }, 
        { 
            $lookup: 
            {from: 'channels', localField: '_id', foreignField: "id", as: "channel"}
        }, 
        { $unwind: "$channel" }, 
        { 
            $project: 
            { 
                count:1,
                channel: {name:1}
            }
        }
    ])
    return result.toArray();
}

export async function insertMessages(messages: IMessageData[]): Promise<void> {
    console.log("Inserting MessagesPage"); // , data);
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_MSGS).insertMany(messages);
    console.log(`Inserted ${result.insertedCount} messages`);
}

export async function findMessages(): Promise<IMessageData[]> {
    console.log("Inserting MessagesPage"); // , data);
    if (! await isDbGood()) {
        return;
    }

    return client.db().collection(COLLECTION_CHANNELS).find({}).toArray();
}

export async function insertUsers(users: IUser[]): Promise<void> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_USERS).insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);
}

export async function findUser(userID: string): Promise<IUser> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_USERS).findOne({ id: userID });
    console.log("User with ID " + userID, result);
}

export async function close(): Promise<void> {
    if (client != null) {
        console.log("Closing db client");
        return client.close();
    }
    else {
        console.log("No db connection to close");
    }
}
