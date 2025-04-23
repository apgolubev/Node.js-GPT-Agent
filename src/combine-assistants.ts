import {AssistantConfig} from './assistant';

export function combineAssistants(agents: AssistantConfig[]) {
    const combinedAssistant: AssistantConfig = {
        name: 'Combined Agents:',
        helloMessage: 'Combined instructions:',
        instructions: '',
        tools: [],
        calls: new Map(),
    }

    for (let agent of agents) {
        combinedAssistant.name += ` 
        - ${agent.name}
        `;
        combinedAssistant.helloMessage += ` 
         ${agent.helloMessage}
        `;
        combinedAssistant.instructions += ` 
         ${agent.instructions}
        `;
        combinedAssistant.tools.push(...agent.tools);
        for (let [tool, func] of agent.calls) {
            combinedAssistant.calls.set(tool, func);
        }
    }

    return combinedAssistant;
}