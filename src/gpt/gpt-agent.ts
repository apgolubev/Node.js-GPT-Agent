import {OpenAI} from 'openai';
import {AssistantTool} from 'openai/resources/beta';

export interface GPTAgentConfig {
    name: string;
    tools: AssistantTool[];
    calls: Map<string, (...args: any[]) => Promise<string>>;
    helloMessage: string;
    instructions: string;
}

export class GptAgent {
    assistant: OpenAI.Beta.Assistant | undefined;
    thread: OpenAI.Beta.Thread | undefined;

    constructor(
        private client: OpenAI,
        private agent: GPTAgentConfig,
        private outputHandler: (output: string) => void,
    ) {
    }

    async init(model: 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano') {
        this.assistant = await this.client.beta.assistants.create({
            name: 'Weather agent',
            model: model,
            tools: this.agent.tools,
            instructions: this.agent.instructions,
        });
        this.thread = await this.client.beta.threads.create();
        this.sendToGPT = this.GPTInput.bind(this, this.assistant, this.thread);
        this.outputHandler(this.agent.helloMessage);
    }

    async sendToGPT(msg: string) {
        this.outputHandler('You need call init first.');
    }

    private async GPTInput(assistant: OpenAI.Beta.Assistant, thread: OpenAI.Beta.Thread, msg: string): Promise<void> {
        const input = await this.client.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: msg,
        });
        const run = await this.client.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        });

        return new Promise(async (resolve, reject) => {
            const fetchResponse = async () => {
                const runStatus = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
                if (runStatus.status === 'requires_action') {
                    if (runStatus.required_action?.type === 'submit_tool_outputs') {
                        const tool_outputs = await this.toolOutputHandler(runStatus.required_action.submit_tool_outputs.tool_calls);
                        await this.client.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                            tool_outputs,
                        });
                    }
                }
                if (runStatus.status === 'completed') {
                    await this.contentHandler(thread);
                    return resolve();
                }
                setTimeout(async () => {
                    fetchResponse();
                }, 15);
            };
            fetchResponse();
        });
    }

    private async toolOutputHandler(
        tools: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[],
    ) {
        const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] = [];

        for (let tool of tools) {
            const func = this.agent.calls.get(tool.function.name);
            if (!func) {
                continue;
            }
            try {
                const arg = JSON.parse(tool.function.arguments);
                const functionResult = await func(arg);
                tool_outputs.push({
                    tool_call_id: tool.id,
                    output: functionResult,
                });
            } catch (e) {
                tool_outputs.push({
                    tool_call_id: tool.id,
                    output: JSON.stringify(e),
                });
                throw e;
            }
        }
        return tool_outputs;
    }

    private async contentHandler(
        thread: OpenAI.Beta.Thread,
    ) {
        const messages = await this.client.beta.threads.messages.list(thread.id);
        const reply = messages.data.find(m => m.role === 'assistant');
        if (!reply) {
            return;
        }
        for (let output of reply.content) {
            if (output.type === 'text') {
                this.outputHandler(output.text.value);
            }
        }
    }
}