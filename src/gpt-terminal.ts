import {GptAgent} from './gpt/gpt-agent';
import {Terminal} from './terminal/terminal';
import {WeatherAgent} from './agents/wttr-agent';
import {TelegramManager} from './agents/telegram-manager';
import {OpenAI} from 'openai';
import {RestAgent} from './agents/rest-agent';
import {FileSystemAgent} from './agents/fs-agent';
import {GPTCombineAgents} from './gpt/gpt-combine-agents';
import {MermaidAgent} from './agents/mermaid-agent';

export const OpenAIClient = new OpenAI({
    apiKey: 'your-key',
});

async function start() {
    /*
        You can combine agents or use one
    */
    const agent = new GptAgent(
        OpenAIClient,
        GPTCombineAgents([
            FileSystemAgent(),
            MermaidAgent(),
            RestAgent(),
            TelegramManager('use demo bot @TerminalGPTAgent_bot: token=8146453355:AAHU42Vxs7ZKGMvCHVEKD0ft_KSYKgX63oY'),
            WeatherAgent(),
        ]),
        (output: string) => {
            console.log(output);
        }
    );
    await agent.init('gpt-4.1-mini');

    /*
        Use Terminal for Node.js
        You can use other env, example: Browser, App, Server, Electron
    */
    const terminal = new Terminal();
    terminal.userPrompt = (line) => {
        return agent.sendToGPT(line);
    };
    terminal.init();
}

start();