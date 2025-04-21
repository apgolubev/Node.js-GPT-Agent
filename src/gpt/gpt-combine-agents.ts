import {GPTAgentConfig} from './gpt-agent';

export function GPTCombineAgents(agents: GPTAgentConfig[]) {
    const combinedAgent: GPTAgentConfig = {
        name: 'Combined Agents:',
        helloMessage: 'Combined instructions:',
        instructions: '',
        tools: [],
        calls: new Map(),
    }

    for (let agent of agents) {
        combinedAgent.name += ` 
        - ${agent.name}
        `;
        combinedAgent.helloMessage += ` 
         ${agent.helloMessage}
        `;
        combinedAgent.instructions += ` 
         ${agent.instructions}
        `;
        combinedAgent.tools.push(...agent.tools);
        for (let [tool, func] of agent.calls) {
            combinedAgent.calls.set(tool, func);
        }
    }

    return combinedAgent;
}