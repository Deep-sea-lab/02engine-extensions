// ==TurboWarp扩展==
// 扩展ID: jwt
// 扩展名称: JWT工具
// 描述: JWT加密、解密和验证功能
// 版本: 1.0.0

(function(Scratch) {
    'use strict';
    
    const { jsrsasign } = window;
    
    class JWTExtension {
        constructor() {
            this.lastResult = '';
            this.lastError = '';
            this.currentPayload = null;
            this.currentHeader = null;
        }
        
        getInfo() {
            return {
                id: 'jwt',
                name: 'JWT工具',
                color1: '#4CAF50',
                color2: '#388E3C',
                color3: '#2E7D32',
                blocks: [
                    {
                        opcode: 'encodeJWT',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '加密文本 [TEXT] 密钥 [SECRET] 有效期 [EXPIRES]秒',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello World'
                            },
                            SECRET: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'mySecretKey'
                            },
                            EXPIRES: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 3600
                            }
                        }
                    },
                    {
                        opcode: 'decodeJWT',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '解密JWT [TOKEN] 密钥 [SECRET]',
                        arguments: {
                            TOKEN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            SECRET: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'mySecretKey'
                            }
                        }
                    },
                    {
                        opcode: 'verifyJWT',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '验证JWT [TOKEN] 密钥 [SECRET]',
                        arguments: {
                            TOKEN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            SECRET: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'mySecretKey'
                            }
                        }
                    },
                    {
                        opcode: 'parseWithoutVerify',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '解析JWT不验证 [TOKEN]',
                        arguments: {
                            TOKEN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getLastResult',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '最后结果'
                    },
                    {
                        opcode: 'getLastError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '最后错误'
                    },
                    {
                        opcode: 'getPayloadData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取载荷数据'
                    },
                    {
                        opcode: 'getHeaderData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取头部数据'
                    },
                    {
                        opcode: 'isTokenExpired',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '令牌是否过期'
                    },
                    '---',
                    {
                        opcode: 'clearAll',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清除所有数据'
                    }
                ],
                menus: {}
            };
        }
        
        // 加密文本为JWT
        encodeJWT(args) {
            try {
                const text = args.TEXT;
                const secret = args.SECRET;
                const expiresIn = Number(args.EXPIRES);
                
                if (!text || !secret) {
                    throw new Error('文本和密钥不能为空');
                }
                
                if (expiresIn <= 0) {
                    throw new Error('有效期必须大于0');
                }
                
                const header = {
                    alg: 'HS256',
                    typ: 'JWT',
                    created: new Date().toISOString()
                };
                
                const currentTime = Math.floor(Date.now() / 1000);
                const payload = {
                    data: text,
                    iat: currentTime,
                    exp: currentTime + expiresIn,
                    timestamp: new Date().toLocaleString()
                };
                
                const sHeader = JSON.stringify(header);
                const sPayload = JSON.stringify(payload);
                
                const token = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, secret);
                
                this.lastResult = token;
                this.lastError = '';
                this.currentPayload = payload;
                this.currentHeader = header;
                
                return token;
            } catch (error) {
                this.lastError = error.message;
                this.lastResult = '';
                console.error('JWT加密错误:', error);
                return `错误: ${error.message}`;
            }
        }
        
        // 解密JWT
        decodeJWT(args) {
            try {
                const token = args.TOKEN;
                const secret = args.SECRET;
                
                if (!token || !secret) {
                    throw new Error('令牌和密钥不能为空');
                }
                
                // 验证JWT
                const isValid = KJUR.jws.JWS.verifyJWT(token, secret, { alg: ['HS256'] });
                
                if (!isValid) {
                    throw new Error('JWT验证失败或已过期');
                }
                
                // 解析payload
                const parts = token.split('.');
                if (parts.length !== 3) {
                    throw new Error('无效的JWT格式');
                }
                
                const payloadJSON = this._decodeBase64Url(parts[1]);
                const payload = JSON.parse(payloadJSON);
                
                this.lastResult = payload.data || JSON.stringify(payload);
                this.lastError = '';
                this.currentPayload = payload;
                
                return this.lastResult;
            } catch (error) {
                this.lastError = error.message;
                this.lastResult = '';
                console.error('JWT解密错误:', error);
                return `错误: ${error.message}`;
            }
        }
        
        // 验证JWT
        verifyJWT(args) {
            try {
                const token = args.TOKEN;
                const secret = args.SECRET;
                
                if (!token || !secret) {
                    return false;
                }
                
                const isValid = KJUR.jws.JWS.verifyJWT(token, secret, { alg: ['HS256'] });
                
                this.lastError = isValid ? '' : '验证失败';
                return isValid;
            } catch (error) {
                this.lastError = error.message;
                return false;
            }
        }
        
        // 解析JWT但不验证
        parseWithoutVerify(args) {
            try {
                const token = args.TOKEN;
                
                if (!token) {
                    throw new Error('令牌不能为空');
                }
                
                const parts = token.split('.');
                if (parts.length !== 3) {
                    throw new Error('无效的JWT格式');
                }
                
                const headerJSON = this._decodeBase64Url(parts[0]);
                const payloadJSON = this._decodeBase64Url(parts[1]);
                
                const header = JSON.parse(headerJSON);
                const payload = JSON.parse(payloadJSON);
                
                this.currentHeader = header;
                this.currentPayload = payload;
                this.lastResult = payload.data || JSON.stringify(payload);
                this.lastError = '';
                
                return this.lastResult;
            } catch (error) {
                this.lastError = error.message;
                this.lastResult = '';
                console.error('JWT解析错误:', error);
                return `错误: ${error.message}`;
            }
        }
        
        // 获取最后结果
        getLastResult() {
            return this.lastResult;
        }
        
        // 获取最后错误
        getLastError() {
            return this.lastError;
        }
        
        // 获取载荷数据
        getPayloadData() {
            return this.currentPayload ? JSON.stringify(this.currentPayload) : '无数据';
        }
        
        // 获取头部数据
        getHeaderData() {
            return this.currentHeader ? JSON.stringify(this.currentHeader) : '无数据';
        }
        
        // 检查令牌是否过期
        isTokenExpired() {
            if (!this.currentPayload || !this.currentPayload.exp) {
                return true;
            }
            
            const currentTime = Math.floor(Date.now() / 1000);
            return currentTime > this.currentPayload.exp;
        }
        
        // 清除所有数据
        clearAll() {
            this.lastResult = '';
            this.lastError = '';
            this.currentPayload = null;
            this.currentHeader = null;
        }
        
        // Base64Url解码辅助函数
        _decodeBase64Url(base64Url) {
            try {
                let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                return decodeURIComponent(escape(atob(base64)));
            } catch (error) {
                throw new Error('Base64解码错误: ' + error.message);
            }
        }
    }
    
    // 检查是否已加载jsrsasign库，如果没有则动态加载
    if (typeof KJUR === 'undefined') {
        async function fetchkjur(){
        const response = await fetch('https://cdn.jsdelivr.net/npm/jsrsasign@10.5.4/lib/jsrsasign-all-min.js');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const scriptCode = await response.text();

        // 在模拟的window环境中执行脚本
        eval(scriptCode);
        console.log('load jsrsasign');
        }
        fetchkjur();
        /*
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsrsasign@10.5.4/lib/jsrsasign-all-min.js';
        script.onload = function() {
            console.log('jsrsasign库加载完成');
        };
        document.head.appendChild(script);*/
    }
    
    Scratch.extensions.register(new JWTExtension());
})(Scratch);
