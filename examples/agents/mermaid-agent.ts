import {AssistantConfig} from '@apgolubev/gpt-agent';
import pako from 'pako';

function pakoMermaid(code: string) {
    const json = {
        'code': code,
        'grid': true,
        'mermaid': '{\n  "theme": "dark"\n}',
        'panZoom': true,
        'rough': false,
        'updateDiagram': true,
        'renderCount': 5,
        'pan': {'x': 0, 'y': 0},
        'zoom': 0.5
    };
    const encode = new TextEncoder().encode(JSON.stringify(json));
    const deflate = pako.deflate(encode, {
        level: 9,
        windowBits: 15,
        memLevel: 8,
        strategy: pako.constants.Z_DEFAULT_STRATEGY
    });
    return Buffer.from(deflate).toString('base64');
}

const MERMAID_BASE_URL = 'https://mermaid.live/edit#pako:';

async function mermaidRequest({ diagram }: { diagram: string }): Promise<string> {
    const url = `${MERMAID_BASE_URL}${pakoMermaid(diagram)}`;
    console.log(url);

    return `Diagram URL: ${url}`;
}

export function MermaidAgent(): AssistantConfig {
    return {
        name: 'Mermaid Diagram Agent',
        helloMessage: `
            This agent can generate links to Mermaid diagrams using GET requests to the following address:
            ${MERMAID_BASE_URL}
            - Use the diagram parameter to pass the Mermaid diagram.
        `,
        instructions: `
            Create Mermaid diagrams and get links for viewing.
            Use the GET method to generate a diagram URL.
            
            Usage example:
            A GET request with the diagram parameter will return a link to the diagram.
            
            Request example: {"method":"GET","diagram":"graph TD; A-->B;"}
        `,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'mermaidRequest',
                    description: 'Generates a link to a Mermaid diagram.',
                    parameters: {
                        type: 'object',
                        properties: {
                            diagram: {
                                type: 'string',
                                description: 'Mermaid diagram text',
                            },
                        },
                        required: ['diagram'],
                    },
                },
            },
        ],
        calls: new Map([
            ['mermaidRequest', mermaidRequest]
        ]),
    };
}
