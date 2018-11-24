import request from "request-promise-native";
import { text } from "body-parser";

const baseUrl = "https://slack.com/api/";

async function post(url:string, form?: any): Promise<any> {
    const token = "xoxp-470338559206-486947582787-486909012852-313369c00b95541c1c05bb7899e2ebdb";

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

    const response = await post(url);
    
    const channels = response.channels as Array<any>;
    return channels.map( (channel: any): IChannel => {
        return {
            id: channel.id,
            name: channel.name
        }
    });
}

async function getMessages(channel: IChannel, startTime?: number): Promise<void> {
    const url = `${baseUrl}channels.history`;
    const form = { 
        channel: channel.id,
        count: 1000,
        oldest: startTime || 0
    };
    console.log(`GetMessages ${channel} startTime ${startTime} form:`, form);

    const response = await post(url, form);
    console.log("RESPONSE", response);

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
        await getMessages(channel, lastTs);
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

async function fetch(): Promise<void> {
    const channels = await getChannels();
    const proms: Promise<any>[] = [];
    for (const channel of channels) {
        getMessages(channel);
    }

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