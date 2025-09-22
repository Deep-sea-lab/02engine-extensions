//1.72修复训练神经网络积木块无限循环问题
class NeuralNetwork {
    constructor() {
        this.layers = [];
        this.learningRate = 0.1;
        this.trainingHistory = []; 
        this.maxHistoryLength = 100; 
    }
    
    addLayer(neuronCount) {
        const weights = this.layers.length > 0 
            ? Array.from({ length: neuronCount }, () => 
                Array.from({ length: this.layers[this.layers.length - 1].neurons }, 
                    () => Math.random() * 2 - 1))
            : [];
        
        this.layers.push({
            neurons: neuronCount,
            weights: weights,
            outputs: new Array(neuronCount).fill(0),
            biases: Array.from({ length: neuronCount }, () => Math.random() * 2 - 1)
        });
        
        return this.layers.length - 1;
    }
    
    removeNeuron(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) return false;
        
        if (layerIndex === 0) {
            this.layers[layerIndex].neurons--;
            this.layers[layerIndex].biases.pop();
            
            if (this.layers.length > 1) {
                this.layers[1].weights.forEach(neuronWeights => {
                    neuronWeights.pop();
                });
            }
        } else {
            this.layers[layerIndex].neurons--;
            this.layers[layerIndex].biases.pop();
            this.layers[layerIndex].weights.pop();
            
            if (layerIndex < this.layers.length - 1) {
                this.layers[layerIndex + 1].weights.forEach(neuronWeights => {
                    neuronWeights.pop();
                });
            }
        }
        
        return true;
    }
    
    addNeuron(layerIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) return false;
        
        if (layerIndex === 0) {
            this.layers[layerIndex].neurons++;
            this.layers[layerIndex].biases.push(Math.random() * 2 - 1);
            
            if (this.layers.length > 1) {
                this.layers[1].weights.forEach(neuronWeights => {
                    neuronWeights.push(Math.random() * 2 - 1);
                });
            }
        } else {
            this.layers[layerIndex].neurons++;
            this.layers[layerIndex].biases.push(Math.random() * 2 - 1);
            
            const prevLayerNeurons = this.layers[layerIndex - 1].neurons;
            this.layers[layerIndex].weights.push(
                Array.from({ length: prevLayerNeurons }, () => Math.random() * 2 - 1)
            );
            
            if (layerIndex < this.layers.length - 1) {
                this.layers[layerIndex + 1].weights.forEach(neuronWeights => {
                    neuronWeights.push(Math.random() * 2 - 1);
                });
            }
        }
        
        return true;
    }
    
    setNeuronBias(layerIndex, neuronIndex, value) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) return false;
        if (neuronIndex < 0 || neuronIndex >= this.layers[layerIndex].neurons) return false;
        
        this.layers[layerIndex].biases[neuronIndex] = value;
        return true;
    }
    
    getNeuronBias(layerIndex, neuronIndex) {
        if (layerIndex < 0 || layerIndex >= this.layers.length) return null;
        if (neuronIndex < 0 || neuronIndex >= this.layers[layerIndex].neurons) return null;
        
        return this.layers[layerIndex].biases[neuronIndex];
    }
    
    setWeight(layerIndex, neuronIndex, weightIndex, value) {
        if (layerIndex <= 0 || layerIndex >= this.layers.length) return false;
        if (neuronIndex < 0 || neuronIndex >= this.layers[layerIndex].neurons) return false;
        if (weightIndex < 0 || weightIndex >= this.layers[layerIndex].weights[neuronIndex].length) return false;
        
        this.layers[layerIndex].weights[neuronIndex][weightIndex] = value;
        return true;
    }
    
    getWeight(layerIndex, neuronIndex, weightIndex) {
        if (layerIndex <= 0 || layerIndex >= this.layers.length) return null;
        if (neuronIndex < 0 || neuronIndex >= this.layers[layerIndex].neurons) return null;
        if (weightIndex < 0 || weightIndex >= this.layers[layerIndex].weights[neuronIndex].length) return null;
        
        return this.layers[layerIndex].weights[neuronIndex][weightIndex];
    }
    
    activate(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    activateDerivative(x) {
        return x * (1 - x);
    }
    
    feedForward(inputs) {
        if (inputs.length !== this.layers[0].neurons) {
            throw new Error("输入数量不匹配");
        }
        
        this.layers[0].outputs = inputs.map((val, i) => 
            this.activate(val + this.layers[0].biases[i])
        );
        
        for (let i = 1; i < this.layers.length; i++) {
            const prevLayer = this.layers[i - 1];
            const currentLayer = this.layers[i];
            
            for (let j = 0; j < currentLayer.neurons; j++) {
                let sum = currentLayer.biases[j];
                for (let k = 0; k < prevLayer.neurons; k++) {
                    sum += prevLayer.outputs[k] * currentLayer.weights[j][k];
                }
                currentLayer.outputs[j] = this.activate(sum);
            }
        }
        
        return [...this.layers[this.layers.length - 1].outputs];
    }
    
    train(inputs, targets) {
        this.feedForward(inputs);
        
        const outputLayer = this.layers[this.layers.length - 1];
        const outputErrors = new Array(outputLayer.neurons).fill(0);
        
        for (let i = 0; i < outputLayer.neurons; i++) {
            outputErrors[i] = targets[i] - outputLayer.outputs[i];
        }
        
        const errors = [outputErrors];
        
        for (let i = this.layers.length - 2; i >= 0; i--) {
            const currentLayer = this.layers[i];
            const nextLayer = this.layers[i + 1];
            const currentErrors = new Array(currentLayer.neurons).fill(0);
            
            for (let j = 0; j < currentLayer.neurons; j++) {
                let error = 0;
                for (let k = 0; k < nextLayer.neurons; k++) {
                    error += nextLayer.weights[k][j] * errors[0][k];
                }
                currentErrors[j] = error;
            }
            
            errors.unshift(currentErrors);
        }
        
        for (let i = 0; i < this.layers.length; i++) {
            const currentLayer = this.layers[i];
            const currentErrors = errors[i];
            
            for (let j = 0; j < currentLayer.neurons; j++) {
                currentLayer.biases[j] += this.learningRate * currentErrors[j] * 
                    this.activateDerivative(currentLayer.outputs[j]);
            }
            
            if (i > 0) {
                const prevLayer = this.layers[i - 1];
                for (let j = 0; j < currentLayer.neurons; j++) {
                    for (let k = 0; k < prevLayer.neurons; k++) {
                        currentLayer.weights[j][k] += this.learningRate * currentErrors[j] * 
                            this.activateDerivative(currentLayer.outputs[j]) * prevLayer.outputs[k];
                    }
                }
            }
        }
        
        const averageError = outputErrors.reduce((sum, error) => sum + error * error, 0) / outputErrors.length;
        this.trainingHistory.push(averageError);
        
        // 保持历史记录长度
        if (this.trainingHistory.length > this.maxHistoryLength) {
            this.trainingHistory.shift();
        }
        
        return averageError;
    }
    
    setLearningRate(rate) {
        this.learningRate = rate;
    }
    
    getStructure() {
        return this.layers.map(layer => ({
            neurons: layer.neurons
        }));
    }
    
    // 获取训练历史数据用于可视化
    getTrainingHistory() {
        return [...this.trainingHistory];
    }
    
    // 获取网络状态用于可视化
    getNetworkState() {
        return this.layers.map(layer => ({
            neurons: layer.neurons,
            outputs: [...layer.outputs],
            biases: [...layer.biases],
            weights: layer.weights.map(neuronWeights => [...neuronWeights])
        }));
    }
}

// 检查是否是浏览器环境
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// 创建可视化面板 - 仅在浏览器环境下执行
function createVisualizationPanel() {
    if (!isBrowser) {
        console.log('提示: 可视化功能仅在浏览器环境中可用');
        return null;
    }
    
    // 检查面板是否已存在
    let panel = document.getElementById('neural-network-visualization');
    if (panel) return panel;
    
    panel = document.createElement('div');
    panel.id = 'neural-network-visualization';
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.width = '400px';
    panel.style.height = '300px';
    panel.style.backgroundColor = 'white';
    panel.style.border = '2px solid #00cc99';
    panel.style.borderRadius = '8px';
    panel.style.padding = '10px';
    panel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    panel.style.zIndex = '1000';
    
    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '神经网络训练可视化';
    title.style.color = '#009973';
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '16px';
    panel.appendChild(title);
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#009973';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        panel.style.display = 'none';
    };
    panel.appendChild(closeBtn);
    
    // 创建误差图表画布
    const errorCanvas = document.createElement('canvas');
    errorCanvas.id = 'error-chart';
    errorCanvas.width = 380;
    errorCanvas.height = 150;
    errorCanvas.style.border = '1px solid #eee';
    panel.appendChild(errorCanvas);
    
    // 创建网络结构可视化区域
    const networkView = document.createElement('div');
    networkView.id = 'network-view';
    networkView.style.marginTop = '10px';
    networkView.style.height = '100px';
    networkView.style.overflow = 'auto';
    panel.appendChild(networkView);
    
    document.body.appendChild(panel);
    return panel;
}

// 绘制训练可视化 - 仅在浏览器环境下执行
function updateVisualization(network) {
    if (!isBrowser) {
        return;
    }
    
    const panel = document.getElementById('neural-network-visualization');
    if (!panel || !network) return;
    
    // 获取历史数据
    const history = network.getTrainingHistory();
    const networkState = network.getNetworkState();
    
    // 绘制误差图表
    const errorCanvas = document.getElementById('error-chart');
    const ctx = errorCanvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, errorCanvas.width, errorCanvas.height);
    
    // 绘制坐标轴
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, 140);
    ctx.lineTo(370, 140);
    ctx.stroke();
    
    // 绘制误差曲线
    if (history.length > 1) {
        ctx.strokeStyle = '#00cc99';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // 找到最大误差值用于缩放
        const maxError = Math.max(...history);
        const scale = maxError > 0 ? 120 / maxError : 1;
        
        // 绘制曲线
        history.forEach((error, i) => {
            const x = 30 + (i / (history.length - 1)) * 340;
            const y = 140 - (error * scale);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 绘制当前误差文本
        ctx.fillStyle = '#009973';
        ctx.font = '12px Arial';
        ctx.fillText(`当前误差: ${history[history.length - 1].toFixed(6)}`, 30, 20);
    }
    
    // 绘制网络结构
    const networkView = document.getElementById('network-view');
    networkView.innerHTML = '<strong>网络结构:</strong><br>';
    
    networkState.forEach((layer, index) => {
        networkView.innerHTML += `层 ${index + 1}: ${layer.neurons} 个神经元 ` +
            `(输出范围: ${Math.min(...layer.outputs).toFixed(2)} - ${Math.max(...layer.outputs).toFixed(2)})<br>`;
    });
}

// 修复Scratch变量初始化顺序问题，先声明Scratch变量
const Scratch = typeof window !== 'undefined' && typeof window.Scratch !== 'undefined' 
    ? window.Scratch 
    : {
        extensions: {
            register: function(extension) {
                console.log('神经网络扩展已在非Scratch环境中注册');
                return extension;
            }
        },
        BlockType: {
            COMMAND: 'command',
            REPORTER: 'reporter'
        },
        ArgumentType: {
            NUMBER: 'number',
            STRING: 'string'
        }
    };

class NeuralNetworkExtension {
    constructor() {
        this.neuralNetwork = null; // 存储神经网络实例
    }
    
    getInfo() {
        return {
            id: 'neuralnetwork',
            name: '神经网络',
            color1: '#00cc99',
            color2: '#00b386',
            color3: '#009973',
            blocks: [
                {
                    opcode: 'createNetwork',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '创建神经网络 输入层:[INPUT] 隐藏层:[HIDDEN] 输出层:[OUTPUT]',
                    arguments: {
                        INPUT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        HIDDEN: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        OUTPUT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'addLayer',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '添加层 神经元数量:[COUNT]',
                    arguments: {
                        COUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'addNeuron',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '向第[LAYER]层添加神经元',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'removeNeuron',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '从第[LAYER]层删除神经元',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setNeuronBias',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置第[LAYER]层第[NEURON]个神经元的偏置为[VALUE]',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        NEURON: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getNeuronBias',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '第[LAYER]层第[NEURON]个神经元的偏置',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        NEURON: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setWeight',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置第[LAYER]层第[NEURON]个神经元的第[WEIGHT]个权重为[VALUE]',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        NEURON: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        WEIGHT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getWeight',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '第[LAYER]层第[NEURON]个神经元的第[WEIGHT]个权重',
                    arguments: {
                        LAYER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        NEURON: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        WEIGHT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setLearningRate',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置学习率为[RATE]',
                    arguments: {
                        RATE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.1
                        }
                    }
                },
                {
                    opcode: 'trainNetwork',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '训练网络 输入:[INPUTS] 目标:[TARGETS]',
                    arguments: {
                        INPUTS: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "0,0"
                        },
                        TARGETS: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "0"
                        }
                    }
                },
                {
                    opcode: 'predict',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '网络预测 输入:[INPUTS]',
                    arguments: {
                        INPUTS: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "0,0"
                        }
                    }
                },
                {
                    opcode: 'showVisualization',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '显示训练可视化面板'
                },
                {
                    opcode: 'hideVisualization',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '隐藏训练可视化面板'
                }
            ]
        };
    }
    
    // 初始化神经网络
    createNetwork(args) {
        this.neuralNetwork = new NeuralNetwork();
        this.neuralNetwork.addLayer(args.INPUT);
        this.neuralNetwork.addLayer(args.HIDDEN);
        this.neuralNetwork.addLayer(args.OUTPUT);
        
        // 创建可视化面板
        createVisualizationPanel();
    }
    
    // 添加层
    addLayer(args) {
        if (this.neuralNetwork) {
            this.neuralNetwork.addLayer(args.COUNT);
            updateVisualization(this.neuralNetwork);
        }
    }
    
    // 添加神经元
    addNeuron(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            this.neuralNetwork.addNeuron(args.LAYER - 1);
            updateVisualization(this.neuralNetwork);
        }
    }
    
    // 删除神经元
    removeNeuron(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            this.neuralNetwork.removeNeuron(args.LAYER - 1);
            updateVisualization(this.neuralNetwork);
        }
    }
    
    // 设置神经元偏置
    setNeuronBias(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            this.neuralNetwork.setNeuronBias(args.LAYER - 1, args.NEURON - 1, args.VALUE);
            updateVisualization(this.neuralNetwork);
        }
    }
    
    // 获取神经元偏置
    getNeuronBias(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            return this.neuralNetwork.getNeuronBias(args.LAYER - 1, args.NEURON - 1);
        }
        return 0;
    }
    
    // 设置权重
    setWeight(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            this.neuralNetwork.setWeight(args.LAYER - 1, args.NEURON - 1, args.WEIGHT - 1, args.VALUE);
            updateVisualization(this.neuralNetwork);
        }
    }
    
    // 获取权重
    getWeight(args) {
        if (this.neuralNetwork) {
            // 转换为0-based索引
            return this.neuralNetwork.getWeight(args.LAYER - 1, args.NEURON - 1, args.WEIGHT - 1);
        }
        return 0;
    }
    
    // 设置学习率
    setLearningRate(args) {
        if (this.neuralNetwork) {
            this.neuralNetwork.setLearningRate(args.RATE);
        }
    }
    
    // 训练网络（确保每次调用只执行一次训练）
    trainNetwork(args) {
        if (!this.neuralNetwork) return;
        
        try {
            // 解析输入和目标值
            const inputs = args.INPUTS.split(',').map(Number);
            const targets = args.TARGETS.split(',').map(Number);
            
            // 验证输入有效性
            if (inputs.some(isNaN) || targets.some(isNaN)) {
                console.error('训练数据包含非数字值');
                return;
            }
            
            // 仅执行一次训练迭代
            const error = this.neuralNetwork.train(inputs, targets);
            
            // 更新可视化
            updateVisualization(this.neuralNetwork);
            
            return error;
        } catch (e) {
            console.error('训练过程出错:', e);
        }
    }
    
    // 预测功能
    predict(args) {
        if (!this.neuralNetwork) return "";
        
        try {
            const inputs = args.INPUTS.split(',').map(Number);
            if (inputs.some(isNaN)) {
                return "输入格式错误";
            }
            
            const output = this.neuralNetwork.feedForward(inputs);
            return output.map(v => v.toFixed(4)).join(', ');
        } catch (e) {
            console.error('预测出错:', e);
            return "预测失败";
        }
    }
    
    // 显示可视化面板
    showVisualization() {
        const panel = createVisualizationPanel();
        if (panel) {
            panel.style.display = 'block';
            if (this.neuralNetwork) {
                updateVisualization(this.neuralNetwork);
            }
        }
    }
    
    // 隐藏可视化面板
    hideVisualization() {
        const panel = document.getElementById('neural-network-visualization');
        if (panel) {
            panel.style.display = 'none';
        }
    }
}

// 注册扩展
const extension = new NeuralNetworkExtension();
Scratch.extensions.register(extension);

// 非Scratch环境下运行简单测试
if (typeof window === 'undefined') {
    console.log('在Node.js环境中测试神经网络功能...');
    
    // 创建测试网络
    extension.createNetwork({INPUT: 2, HIDDEN: 2, OUTPUT: 1});
    extension.setLearningRate({RATE: 0.3});
    
    // 训练XOR问题
    const trainingData = [
        {inputs: [0, 0], targets: [0]},
        {inputs: [0, 1], targets: [1]},
        {inputs: [1, 0], targets: [1]},
        {inputs: [1, 1], targets: [0]}
    ];
    
    // 训练10000次
    for (let i = 0; i < 10000; i++) {
        const data = trainingData[Math.floor(Math.random() * trainingData.length)];
        extension.trainNetwork({
            INPUTS: data.inputs.join(','),
            TARGETS: data.targets.join(',')
        });
        
        // 每1000次打印一次进度
        if (i % 1000 === 0) {
            console.log(`训练进度: ${i}/10000`);
        }
    }
    
    // 测试结果
    console.log('\n测试结果:');
    console.log('输入 [0,0] 预测:', extension.predict({INPUTS: '0,0'}));
    console.log('输入 [0,1] 预测:', extension.predict({INPUTS: '0,1'}));
    console.log('输入 [1,0] 预测:', extension.predict({INPUTS: '1,0'}));
    console.log('输入 [1,1] 预测:', extension.predict({INPUTS: '1,1'}));
}
