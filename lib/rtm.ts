import Config from "./config";
import * as db from "./db";
import { IMessageData } from "./crawler";

const EVENT_MESSAGE = "message";
const EVENT_NEW_RXN = "reaction_added";
const EVENT_RXN_REMOVED = "reaction_removed";

export default class Rtm {

    private static socket;

    public static startRTM(socket: any): Promise<void> {
        this.socket = socket;

        return new Promise<void>( (resolve, reject) => {
            setTimeout(() => reject("RTM didn't initialize in time"), 10000);

            // tslint:disable-next-line:no-var-requires no-require-imports
            const { RTMClient } = require("@slack/client");

            const rtm = new RTMClient(Config.token);
            console.log("RTM starting up I hope!");
            rtm.start();

            // Log all incoming messages
            rtm.on(EVENT_MESSAGE, (event) => {
                // Structure of `event`: <https://api.slack.com/events/message>
                console.log(`Message from ${event.user}: ${event.text}`, event);

                if (event.user == null || event.text == null) {
                    // I've seen this happen where thread replies get pushed twice, and one of the events is missing this data
                    console.error("Received weird new message", event);
                    return;
                }

                const msg: IMessageData = {
                    channelID: event.channel,
                    user: event.user,
                    text: event.text,
                    time: event.ts,
                    subtype: event.subtype,

                    threadID: event.thread_ts,
                    replyCount: event.reply_count,
                    replies: event.replies,
                };

                console.log("Inserting RTM message");
                db.insertMessage(msg);

                this.propagateEvent(EVENT_MESSAGE, msg);
            });

            // Log all reactions
            rtm.on(EVENT_NEW_RXN, (event) => {
                // Structure of `event`: <https://api.slack.com/events/reaction_added>
                console.log(`Reaction from ${event.user}: ${event.reaction}`, event);
                this.propagateEvent(EVENT_NEW_RXN, event);
            });

            rtm.on(EVENT_RXN_REMOVED, (event) => {
                // Structure of `event`: <https://api.slack.com/events/reaction_removed>
                console.log(`Reaction removed by ${event.user}: ${event.reaction}`, event);
                this.propagateEvent(EVENT_RXN_REMOVED, event);
            });

            // Send a message once the connection is ready
            rtm.on("ready", () => {
                console.log("RTM ready");

                // Getting a conversation ID is left as an exercise for the reader. It's usually available as the `channel` property
                // on incoming messages, or in responses to Web API requests.

                // const conversationId = '';
                // rtm.sendMessage('Hello, world!', conversationId);
                resolve();
            });
        });
    }

    private static propagateEvent(eventType: string, payload: any) {
        this.socket.emit(eventType, payload);
    }
}
