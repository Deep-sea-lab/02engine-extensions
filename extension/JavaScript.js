class JavaScriptExtension {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getInfo() {
    return {
      id: 'javascript',
      name: 'JavaScript',
      blocks: [
        {
          opcode: 'runJS',
          blockType: Scratch.BlockType.COMMAND,
          text: '运行JavaScript [CODE]',
          arguments: {
            CODE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'alert("Hello from JS!");'
            }
          }
        },
        {
          opcode: 'runJSWithResult',
          blockType: Scratch.BlockType.REPORTER,
          text: '运行JavaScript并返回结果 [CODE]',
          arguments: {
            CODE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '2 + 2'
            }
          }
        }
      ]
    };
  }

  runJS(args) {
    try {
      
      eval(args.CODE);
    } catch (error) {
      console.error('JavaScript执行错误:', error);
    }
  }

  runJSWithResult(args) {
    try {
      
      return eval(args.CODE);
    } catch (error) {
      console.error('JavaScript执行错误:', error);
      return '';
    }
  }
}


Scratch.extensions.register(new JavaScriptExtension());