import ReadLine from 'readline';

export class Terminal {
    rl = ReadLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'You> '
    });

    init() {
        this.rl.prompt();
        this.rl.on('line', this.#send.bind(this)).on('close', this.#close.bind(this));
    }

    async userPrompt(line: string) {
    }

    async #send(line: string) {
        await this.userPrompt(line);
        this.rl.prompt();
    }

    #close() {
        console.log('Chat closed. Goodbye!');
        process.exit(0);
    }
}

