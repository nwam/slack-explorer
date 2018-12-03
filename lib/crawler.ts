import request from "request-promise-native";
import * as db from "./db";

const baseUrl = "https://slack.com/api/";

export interface IChannel {
    id: string;
    name: string;
    isPrivate: boolean;
}

export interface IMessageData {
    channelID: string;
    user: string;
    text: string;
    time: number;
    subtype?: string;

    threadID?: number;
    replyCount?: number;
    replies?: any[];
}

export interface IUser {
    id: string;
    name: string;
    statusText?: string;
    statusEmoji?: string;
    isAdmin: boolean;
    isAppUser: boolean;
}

let _token;

async function post(family: string, method: string, form?: any): Promise<any> {
    if (_token == null) {
        console.error("There's no token, I can't do anything!");
    }

    const url = `${baseUrl}${family}.${method}`;
    console.log(`Posting up to ${url} payload is:`, form);

    const headers = {
        "accept-language": "en-US,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${_token}`
    };

    const fullForm = form || {};
    fullForm.token = _token;

    return request.post({
        json: true,
        headers: headers,
        url: url,
        form: fullForm
    });
}

async function getChannels(): Promise<IChannel[]>{
    return await getList("channels");
}

async function getGroups(): Promise<IChannel[]>{
    return await getList("groups");
}

async function getList(family: string) : Promise<IChannel[]>{
    const response = await post(family, "list");

    const channels = (response.channels || response.groups);

    if (channels == null) {
        console.error("Channel get failed, response was:", response);
        return;
    }

    return channels.map( (channel: any): IChannel => {
        return {
            id: channel.id,
            name: channel.name,
            isPrivate: family === "groups"
        };
    });
}

async function getChannelMessages(channel: IChannel): Promise<void> {
    return getMessages(channel, "channels");
}

async function getGroupMessages(channel: IChannel): Promise<void> {
    return getMessages(channel, "groups");
}

async function getMessages(channel: IChannel, family: string, startTime?: number): Promise<void> {
    const form = {
        channel: channel.id,
        count: 1000,
        oldest: startTime || 0
    };
    console.log(`GetMessages ${JSON.stringify(channel)} startTime ${startTime} form:`, form);

    const response = await post(family, "history", { channel: channel.id, count: 1000 });
    // console.log("RESPONSE", response);

    if (response.messages == null) {
        console.error("Got null messages, response was:", response);
        return;
    }
    const messagesPage: IMessageData[] = response.messages.map(
        (m: any) => {
            const md: IMessageData = {
                channelID: channel.id,
                user: m.user,
                text: m.text,
                time: m.ts,
                subtype: m.subtype,

                threadID: m.thread_ts,
                replyCount: m.reply_count,
                replies: m.replies,
            };

            return md;
        });

    // console.log("MessagesPage", messagesPage);

    await db.insertMessages(messagesPage);

    if (response.has_more === true) {
        const lastTs = messagesPage[messagesPage.length - 1].time;

        console.log("Recursively getting messages for channel " + channel.name);
        await getMessages(channel, family, lastTs);
    }
    else {
        console.log(`Done getting messages for ${family.substring(0, family.length - 1)} ${channel.name}`);
    }
}

async function fetchChannels(): Promise<void> {
    const channels = await getChannels();
    // console.log("here are the channels", channels);
    await db.insertChannels(channels);
    const proms: Array<Promise<any>> = [];
    for (const channel of channels) {
        proms.push(getChannelMessages(channel));
    }
    // tslint:disable-next-line:no-empty
    return Promise.all(proms).then( () => {});
}

async function fetchGroups(): Promise<void> {
    const groups = await getGroups();
    // console.log("here are the groups", groups);
    await db.insertChannels(groups);
    const proms: Array<Promise<any>> = [];
    for (const group of groups) {
        proms.push(getGroupMessages(group));
    }
    // tslint:disable-next-line:no-empty
    return Promise.all(proms).then( () => {});
}

async function fetchUsers(): Promise<void> {
    const result = await post("users", "list", { limit: Number.MAX_SAFE_INTEGER });
    if (result == null || result.members == null) {
        console.error("Bad users result", result);
        return;
    }
    // tslint:disable-next-line:array-type
    const members = result.members as Array<any>;
    const users: IUser[] = members.map( (user: any): IUser => {
        return {
            id: user.id,
            name: user.name,
            isAdmin: user.is_admin,
            isAppUser: user.is_app_user
        };
    });

    await db.insertUsers(users);
}

const fetch = async (token: string): Promise<void> => {
    _token = token;
    await db.dropDb();

    const channels = fetchChannels().then(() => console.log("done channels"));
    const groups = fetchGroups().then(() => console.log("done groups"));
    const users = fetchUsers().then(() => console.log("done users"));
    await Promise.all([ channels, groups, users ]);

    console.log("Closing DB");
    db.close();
    console.log("Done fetch!");
};

export default fetch;
