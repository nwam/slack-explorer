import request from "request-promise-native";
import { text } from "body-parser";

const baseUrl = "https://slack.com/api/";

async function post(url:string, form?: any): Promise<any> {
    console.log(`Posting up to ${url}`);
    const token = "xoxp-470338559206-486947582787-487036353107-99216ec518fe9d0cb5d1a7a2a11a0ec5";

    const headers = {
        'accept-language': 'en-US,en;q=0.8',
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
    };

    const fullForm = form || {};
    fullForm["token"] = token;

    return request.post({
        json: true,
        headers: headers,
        url: url,
        form: fullForm
    });
}

async function getChannels(): Promise<IChannel[]>{
    const url = `${baseUrl}channels.list`;
    return await getIds(url);
}

async function getGroups(): Promise<IChannel[]>{
    const url = `${baseUrl}groups.list`;
    return await getIds(url);
}

async function getIds(url: string) : Promise<IChannel[]>{
    const response = await post(url);
    
    const channels = (response.channels || response.groups) as Array<any>;
    return channels.map( (channel: any): IChannel => {
        return {
            id: channel.id,
            name: channel.name
        }
    });
}

async function getChannelMessages(channel: IChannel): Promise<void> {
    const url = `${baseUrl}channels.history`;
    return getMessages(channel, url);
}

async function getGroupMessages(channel: IChannel): Promise<void> {
    const url = `${baseUrl}groups.history`;
    return getMessages(channel, url);
}

async function getMessages(channel: IChannel, url: string, startTime?: number): Promise<void> {
    const form = { 
        channel: channel.id,
        count: 1000,
        oldest: startTime || 0
    };
    console.log(`GetMessages ${JSON.stringify(channel)} startTime ${startTime} form:`, form);

    const response = await post(url, form);
    console.log("RESPONSE", response);

    if (response.messages == null) {
        return;
    }
    const messagesPage: IMessageData[] = response.messages.map(
        (m: any) => {
            const md: IMessageData = {
                user: m.user,
                text: m.text,
                time: m.ts,

                threadID: m.thread_ts,
                replyCount: m.reply_count,
                replies: m.replies,
            }

            return md;
        });
    
    console.log("MessagesPage", messagesPage);
    
    if (response.has_more == true) {
        const lastTs = messagesPage[messagesPage.length - 1].time;
        await getMessages(channel, url, lastTs);
    }
}

interface IChannel {
    id: string,
    name: string
}

interface IMessageData {
    user: string,
    text: string,
    time: number,

    threadID?: number,
    replyCount?: number,
    replies?: Array<any>
}

async function fetchChannels(): Promise<void> {
    const channels = await getChannels();
    const proms: Promise<any>[] = [];
    for (const channel of channels) {
        getChannelMessages(channel);
    }
}

async function fetchGroups(): Promise<void> {
    const groups = await getGroups();
    const proms: Promise<any>[] = [];
    for (const group of groups) {
        getGroupMessages(group);
    }
}

function fetch(): void {
    fetchChannels();
    fetchGroups();
}

fetch();

/*
async function fetch(): Promise<IChannelData[]> {
    const channelIDs = await getChannelIds();
    const channelDataPromises: Promise<IChannelData>[] = [];
    for (const id of channelIDs) {
        const messagesPromise = getMessages(id)
            .then( (messages): IChannelData => {
                return {
                    id: id,
                    name: "idk",
                    data: messages
                }
            });
        channelDataPromises.push(messagesPromise);
    }

    return Promise.all(channelDataPromises);
}*/
/*
  - Get list of channels
  - async For each channel
    - get list of messages
    - filter out what we don't care about
      - files
    - push that list of messages to the db
    - repeat until no more messages
  - After all channel data is grabbed
  -
*/