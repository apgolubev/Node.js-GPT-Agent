import {AssistantConfig} from 'gpt-agent';

function sendToBot(arg: { [key: string]: any }): Promise<string> {
    const token = arg.token;
    const chat_id = arg.chat_id;
    const text = arg.text;
    return new Promise((resolve, reject) => {
        try {
            fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({chat_id, text})
            }).then(res => {
                res.text().then(text => resolve('Message sent: ' + text));
            })
        } catch (e) {
            reject(e)
        }
    });
}

export function TelegramManager(demoBot: string): AssistantConfig {
    return {
        name: 'Telegram Manager',
        helloMessage: `
            This agent can send messages on behalf of a bot in Telegram.
            - You must provide the bot token in the format: 8146453***:AAHU42Vxs7ZKGMvCHVEKD0ft_KSYKgX****
            - You must specify the chat_id, which is a numeric ID of the user or group in the format: 11***4183
            - You can find your ID by messaging @userinfobot.
        `,
        instructions: `
            Use the Telegram API in tools to send messages.
            - You need to provide the bot token in the format 8146453***:AAHU42Vxs7ZKGMvCHVEKD0ft_KSYKgX****
            - You need to specify the chat_id, which is the numeric ID of the user or group in the format 11***4183
            - You can find out your own ID using @userinfobot
            - Display the name of the bot to which the message was sent.
        
            Explain to the user how to use the bot. This is your main task.
            
            ${demoBot}
        `,
        tools: [
            {
                'type': 'function',
                function: {
                    name: 'sendMessage',
                    description: 'Send a message from telegram bot',
                    parameters: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'Bot token'
                            },
                            chat_id: {
                                type: 'string',
                                description: 'User or group chat_id'
                            },
                            text: {
                                type: 'string',
                                description: 'Text message'
                            },
                        },
                        required: ['token', 'chat_id', 'text']
                    }
                },
            },
        ],
        calls: new Map([
            ['sendMessage', sendToBot]
        ]),
    }
};