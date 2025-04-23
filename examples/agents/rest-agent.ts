import {AssistantConfig} from 'gpt-agent';

const BASE_URL = 'https://webhook.site/ab6f90bf-1fa3-4516-846f-3413e94b2cf6';

async function restRequest({ method, endpoint, body }: { method: string, endpoint?: string, body?: any }): Promise<string> {
    const url = endpoint ? `${BASE_URL}/${endpoint}` : BASE_URL;
    try {
        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: body ? JSON.stringify(body) : undefined,
        });

        const text = await response.text();
        return `Status: ${response.status}, Response: ${text}`;
    } catch (e) {
        throw new Error(`Request failed: ${e}`);
    }
}

export function RestAgent(): AssistantConfig {
    return {
        name: 'REST API Agent',
        helloMessage: `
            This agent can perform HTTP requests (GET, POST, PUT, DELETE, HEAD) to the address:
            ${BASE_URL}
            - Use the endpoint to access resources.
            - Use the body to send data in POST and PUT requests.
        `,
        instructions: `
            Use the REST API with the methods GET, POST, PUT, DELETE, and HEAD.
            The endpoint is optional and is appended to the base URL.
            For POST and PUT requests, you can send JSON data via the body.
            
            Examples:
            
            A GET request without an endpoint will return data from the base URL.
            
            A POST request with a body will send data to the server.
            
            Return valid JSON when returning JSON.
            Example response: {"method":"POST","endpoint":"","body":{test: "name"}}
        `,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'restRequest',
                    description: 'Performs a REST request.',
                    parameters: {
                        type: 'object',
                        properties: {
                            method: {
                                type: 'string',
                                enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                                description: 'HTTP request method',
                            },
                            endpoint: {
                                type: 'string',
                                description: 'Additional resource path (optional)',
                            },
                            body: {
                                type: 'object',
                                description: 'Request body for POST and PUT (optional)',
                            },
                        },
                        required: ['method'],
                    },
                },
            },
        ],
        calls: new Map([
            ['restRequest', restRequest]
        ]),
    };
}