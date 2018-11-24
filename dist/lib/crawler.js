"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const baseUrl = "https://slack.com/api/";
function post(url, form) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = "xoxp-470338559206-486947582787-486909012852-313369c00b95541c1c05bb7899e2ebdb";
        const headers = {
            'accept-language': 'en-US,en;q=0.8',
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        };
        const fullForm = form || {};
        fullForm["token"] = token;
        return request_promise_native_1.default.post({
            json: true,
            headers: headers,
            url: url,
            form: fullForm
        });
    });
}
function getChannels() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${baseUrl}channels.list`;
        const response = yield post(url);
        const channels = response.channels;
        return channels.map((channel) => {
            return {
                id: channel.id,
                name: channel.name
            };
        });
    });
}
function getMessages(channel, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${baseUrl}channels.history`;
        const form = {
            channel: channel.id,
            count: 1000,
            oldest: startTime || 0
        };
        console.log(`GetMessages ${channel} startTime ${startTime} form:`, form);
        const response = yield post(url, form);
        console.log("RESPONSE", response);
        const messagesPage = response.messages.map((m) => {
            const md = {
                user: m.user,
                text: m.text,
                time: m.ts,
                threadID: m.thread_ts,
                replyCount: m.reply_count,
                replies: m.replies,
            };
            return md;
        });
        console.log("MessagesPage", messagesPage);
        if (response.has_more == true) {
            const lastTs = messagesPage[messagesPage.length - 1].time;
            yield getMessages(channel, lastTs);
        }
    });
}
function fetch() {
    return __awaiter(this, void 0, void 0, function* () {
        const channels = yield getChannels();
        const proms = [];
        for (const channel of channels) {
            getMessages(channel);
        }
    });
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
//# sourceMappingURL=crawler.js.map