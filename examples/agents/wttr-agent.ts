import {AssistantConfig} from '@apgolubev/gpt-agent';

function getWttr(arg: { [key: string]: any }): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            console.log(`Get: https://wttr.in/${arg.location}`);
            fetch(`https://wttr.in/${arg.location}?format=j1&0`).then(res => {
                res.json().then((json) => {
                    resolve('temp_C: ' + json.current_condition[0].temp_C);
                })
            })
        } catch (e) {
            reject(e)
        }
    });
}

export function WeatherAgent(): AssistantConfig {
    return {
        name: 'Weather agent',
        helloMessage: 'This bot provides weather updates for a city.',
        instructions: 'Request the weather via the API using getWttr.',
        tools: [
            {
                'type': 'function',
                function: {
                    name: "getWttr",
                    description: "Get weather by city name",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "City to get weather for"
                            }
                        },
                        required: ["city"]
                    }
                },
            },
        ],
        calls: new Map([
            ['getWttr', getWttr]
        ]),
    };
}