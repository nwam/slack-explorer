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

    const resultCursor = await client.db().collection("messages").aggregate([
        {
            $group:
            {
                _id: "$channelID",
                count: { $sum: 1 }
            }
        },
        {
            $lookup:
            {
                from: "channels",
                localField: "_id",
                foreignField: "id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project:
            {
                count: 1,
                channel: {name: 1}
            }
        }
    ]);
    const result = await resultCursor.toArray();
    return result.map( (item) => {return {
        channelId : item._id,
        channelName : `#${item.channel.name}`,
        count : item.count
    }});
}

export async function findUserTotals(): Promise<any> {
    if (! await isDbGood()) {
        return;
    }

    const resultCursor = await client.db().collection("messages").aggregate([
        {
            $group:
            {
                _id: "$user",
                count: { $sum: 1 }
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "_id",
                foreignField: "id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project:
            {
                count: 1,
                user: {name: 1, isAdmin: 1}
            }
        }
    ]);
    const result = await resultCursor.toArray();
    return result.map( (item) => {return {
        userId : item._id,
        userName : item.user.name,
        isAdmin : item.user.isAdmin,
        count : item.count
    }});
}

export async function findUsersInteractions(): Promise<any> {
    if (! await isDbGood()) {
        return;
    }

    const resultCursor = await client.db().collection("messages").aggregate([
        {
            $match : {
                subtype : { $not : { $eq : "channel_join"} }
            }
        },
        {
            $group : {
                _id : {user: "$user", channel: "$channelID"},
                userID : {$max: "$user"},
                channelID : {$max: "$channelID"},
                count : {$sum:1}
            }
        },
        {
            $lookup : {
                from: "users",
                localField: "userID",
                foreignField: "id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $project:
            {
                userID : 1,
                channelID : 1,
                count: 1,
                user: {name:1}
            }
        }
    ]);
    const result = await resultCursor.toArray();
    return result.map( (item) => { return {
        userId : item.userID,
        channelId : item.channelID,
        count : item.count,
    }});
}

export async function findUserMessages(userId: string): Promise<any> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection("messages").find(
        { user : userId }
    );
    return result.toArray();
}

export async function findChannelMessages(channelId: string): Promise<any> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection("messages").find(
        {channelID : channelId});
    return result.toArray();
}

export async function insertMessage(message: IMessageData): Promise<void> {
    if (! await isDbGood()) {
        return;
    }

    const result = await client.db().collection(COLLECTION_MSGS).insertOne(message);
    console.log(`Inserted ${result.insertedCount} (should be 1) message`);
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

//findUsersInteractions().then( (result) => console.log(result));
findUserTotals().then( (result) => console.log(result));
//findChannelMessages("CDXKBM9N2").then( (r) => console.log(r));