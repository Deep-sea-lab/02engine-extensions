class LMStudioExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.cleanResponse = this.cleanResponse.bind(this);
    }

    getInfo() {
        return {
            id: 'lmstudio',
            name: 'LM Studio',
            color1: '#4C6EF5',
            color2: '#3B5BDB',
            blocks: [
                {
                    opcode: 'askAI',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'ask model [MODEL] with prompt: [PROMPT]',
                    arguments: {
                        MODEL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'llama-2-7b-chat'
                        },
                        PROMPT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Hello'
                        }
                    }
                },
                {
                    opcode: 'cleanText',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'clean [TEXT] by removing <think> tags',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'This <think>internal</think> text'
                        }
                    }
                }
            ],
            menus: {}
        };
    }

    cleanText(args) {
        return this.cleanResponse(args.TEXT);
    }

    askAI(args) {
        const model = args.MODEL;
        const prompt = args.PROMPT;

        // 返回一个Promise对象，Scratch会等待其解析
        return new Promise((resolve) => {
            fetch('http://localhost:1234/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: "system",
                            content: "你是一个助手。当需要内部思考时，请将思考过程放在<think></think>标签内，最终回复只保留纯文本。"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                })
            })
                .then(response => response.json())
                .then(data => {
                    const rawResponse = data.choices[0].message.content;
                    resolve(this.cleanResponse(rawResponse));
                })
                .catch(error => {
                    console.error('Error:', error);
                    resolve(`Error: ${error.message}`);
                });
        });
    }

    cleanResponse(text) {
        // 多重清理策略
        let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
        cleaned = cleaned.replace(/<\/?[a-z][\s\S]*?>/gi, '');
        cleaned = cleaned.replace(/\[.*?\]/g, '');
        return cleaned.trim();
    }
}

// 注册扩展
Scratch.extensions.register(new LMStudioExtension());