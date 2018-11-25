// tslint:disable-next-line:no-require-imports
import Mongo = require("mongodb");
import { IMessageData, IChannel, IUser } from "./crawler";
import { stringify } from "querystring";

const dbHost = "localhost";
const DB_CREDS = "";
const dbName = "db";
const dbUrl = `mongodb://${DB_CREDS}${dbHost}:27017/${dbName}`;
// tslint:disable-next-line:max-line-length
const common_words : Set<string> = new Set(["the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with","his","they","I","at","be","this","have","from","or","one","had","by","word","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","him","into"]);

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

    return client.db().collection(COLLECTION_CHANNELS).findOne({ id: channelID });
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
    return result.map( (item) => {
        return {
            id : item._id,
            name : `#${item.channel.name}`,
            count : item.count
        };
    });
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
        id : item._id,
        name : item.user.name,
        isAdmin : item.user.isAdmin,
        count : item.count
    }; });
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
                _id : { user: "$user", channel: "$channelID" },
                userID : { $max: "$user" },
                channelID : { $max: "$channelID" },
                count : { $sum: 1}
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
                user: {name: 1}
            }
        }
    ]);
    const result = await resultCursor.toArray();
    return result.map( (item) => {
            return {
                userId : item.userID,
                channelId : item.channelID,
                count : item.count,
        };
    });
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

export async function findEntityMessages(id: string, type: string): Promise<any> {
    if (type === "channel") {
        return findChannelMessages(id);
    } else if (type === "user") {
        return findUserMessages(id);
    }
    return null;
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
    return result;
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

export function countWords(messages: IMessageData[], topn = 250): any {
    const occurrences: Map<string, number> = new Map<string, number>();
    messages.forEach( (msg) => {
        if (msg.subtype == 'channel_join') {
            return;
        }
        const words: string[] = msg.text.split(/[\s!\.]/);

        words.forEach( (word) => {
            word = word.toLowerCase();
            if (word.length < 3 || common_words.has(word)) {
                return;
            }
            const count = occurrences[word] + 1 || 1;
            occurrences[word] = count;
        });
    });
    const sortable = [];
    for (const word of occurrences) {
        sortable.push({
            text: word,
            size: occurrences[word as any]
        });
    }
    const sorted = sortable.sort( (oc1, oc2) => {
        return oc2.size - oc1.size;
    });
    return sorted.slice(0, topn);
}

// findUsersqInteractions().then( (result) => console.log(result));
// findUserTotals().then( (result) => console.log(result));
findChannelMessages("CDXKBM9N2").then( (r) => console.log(countWords(r)));
