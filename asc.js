const fs = require('fs');
const path = require('path');

class Interpreter {
    constructor() {
        this.variables = {};
    }

    execute(code) {
        const lines = code.split(';').map(line => line.trim()).filter(line => line.length > 0);
        for (const line of lines) {
            this.executeLine(line);
        }
    }

    executeLine(line) {
        if (line.startsWith('let ')) {
            this.handleVariableDeclaration(line);
        } else if (line.startsWith('print ')) {
            this.handlePrint(line);
        } else if (line.startsWith('if ')) {
            this.handleIf(line);
        } else if (line.startsWith('while ')) {
            this.handleWhile(line);
        } else {
            throw new Error(`Unknown command: ${line}`);
        }
    }

    handleVariableDeclaration(line) {
        const match = line.match(/let (\w+) = (.+)/);
    if (!match) {
        throw new Error(`Invalid variable declaration: ${line}`);
    }
    const [, name, value] = match;
    if (value.startsWith('"') && value.endsWith('"')) {
        this.variables[name] = value.slice(1, -1);
    } else {
        this.variables[name] = this.evaluateExpression(value);
    }
    }

    handlePrint(line) {
        const expression = line.slice(6);
        const result = this.evaluateExpression(expression);
        console.log(result);
    }

    handleIf(line) {
        const match = line.match(/if\s+(.+?)\s*{([^]*?)}(else\s*{([^]*?)})?/);
        if (!match) {
            throw new Error(`Invalid if statement: ${line}`);
        }
        const [, condition, trueBlock, , falseBlock] = match;
    
        const shouldExecuteFalseBlock = falseBlock ? falseBlock.trim() : null;
        const conditionResult = this.evaluateExpression(condition);
    
        if (conditionResult) {
            return this.execute(trueBlock.trim());
        } else if (shouldExecuteFalseBlock) {
            return this.execute(shouldExecuteFalseBlock);
        }
    }

    handleWhile(line) {
        const [, condition, block] = line.match(/while (.+) { (.+) }/);
        while (this.evaluateExpression(condition)) {
            this.execute(block);
        }
    }

    evaluateExpression(expression) {
        const tokens = expression.split(/\s+/);
        let result = this.evaluateToken(tokens.shift());

        while (tokens.length > 0) {
            const operator = tokens.shift();
            const nextToken = tokens.shift();
            const nextValue = this.evaluateToken(nextToken);

            switch (operator) {
                case '+':
                    result += nextValue;
                    break;
                case '-':
                    result -= nextValue;
                    break;
                case '*':
                    result *= nextValue;
                    break;
                case '/':
                    result /= nextValue;
                    break;
                case '^':
                    result = Math.pow(result, nextValue);
                    break;
                case '==':
                    result = (result === nextValue);
                    break;
                default:
                    throw new Error(`Unknown operator: ${operator}`);
            }
        }

        return result;
    }

    evaluateToken(token) {
        if (token in this.variables) {
            return this.variables[token];
        } else if (!isNaN(token)) {
            return parseFloat(token);
        } else if (token.startsWith('"') && token.endsWith('"')) {
            return token.slice(1, -1);
        } else {
            throw new Error(`Unknown token: ${token}`);
        }
    }
}

// Reading code file
const filePath = process.argv[2];

if (filePath === "-h") {
    console.log("asc usage: asc test.as");
    process.exit(0);
}


if (!filePath) {
    console.error('Пожалуйста, укажите путь к файлу.');
    process.exit(1); 
}

const code = fs.readFileSync(path.resolve(filePath), 'utf-8');
const interpreter = new Interpreter();
interpreter.execute(code);