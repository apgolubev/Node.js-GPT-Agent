import {AssistantConfig} from 'gpt-agent';
import fs from 'fs/promises';

async function fileSystemOperation({ action, filePath, data }: { action: string, filePath: string, data?: string }): Promise<string> {
    const localFilePath = './examples/fs-files/' + filePath;
    try {
        switch (action) {
            case 'readdir':
                return await fs.readdir(localFilePath, 'utf-8').then(files => files.join(';'));
            case 'read':
                return await fs.readFile(localFilePath, 'utf-8');
            case 'mkdir':
                return await fs.mkdir(localFilePath).then() || `Directory ${filePath} created`;
            case 'write':
                if (data === undefined) throw new Error('Data must be provided for write action');
                await fs.writeFile(localFilePath, data, 'utf-8');
                return `File written successfully at ${localFilePath}`;
            case 'append':
                if (data === undefined) throw new Error('Data must be provided for append action');
                await fs.appendFile(localFilePath, data, 'utf-8');
                return `Data appended successfully at ${localFilePath}`;
            case 'delete':
                await fs.unlink(localFilePath);
                return `File deleted successfully at ${localFilePath}`;
            default:
                throw new Error('Unsupported action');
        }
    } catch (e) {
        throw new Error(`File operation failed: ${e}`);
    }
}

export function FileSystemAgent(): AssistantConfig {
    return {
        name: 'File System Agent',
        helloMessage: `
            This agent can work with the Node.js file system.  
            - Supported actions: read, write, append, delete.  
            - A file path (filePath) must be specified.  
            - For the write and append actions, data must be provided.
        `,
        instructions: `
        Use the Node.js file system to perform file operations.

        Examples:
        - read: read the contents of a file.
        - write: write data to a file (create/overwrite).
        - append: add data to the end of a file.
        - delete: delete a file.
        `,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'fileSystemOperation',
                    description: 'Performs file operations using Node.js.',
                    parameters: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['readdir', 'mkdir', 'read', 'write', 'append', 'delete'],
                                description: 'Type of operation',
                            },
                            filePath: {
                                type: 'string',
                                description: 'File path, ./ as default.',
                            },
                            data: {
                                type: 'string',
                                description: 'Data to write or append to the file (only for write and append operations).',
                            },
                        },
                        required: ['action', 'filePath'],
                    },
                },
            },
        ],
        calls: new Map([
            ['fileSystemOperation', fileSystemOperation]
        ]),
    };
};
