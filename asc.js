#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lexer - Converts source code into tokens
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[this.position];
    this.keywords = [
      'let', 'if', 'else', 'while', 'function', 
      'return', 'true', 'false', 'print'
    ];
  }

  advance() {
    this.position++;
    if (this.position < this.input.length) {
      this.currentChar = this.input[this.position];
    } else {
      this.currentChar = null;
    }
  }

  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  number() {
    let result = '';
    while (this.currentChar && /\d/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    if (this.currentChar === '.') {
      result += this.currentChar;
      this.advance();
      
      while (this.currentChar && /\d/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      
      return { type: 'NUMBER', value: parseFloat(result) };
    }
    
    return { type: 'NUMBER', value: parseInt(result) };
  }

  identifier() {
    let result = '';
    while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    if (this.keywords.includes(result)) {
      return { type: result.toUpperCase(), value: result };
    }
    
    return { type: 'IDENTIFIER', value: result };
  }

  string() {
    let result = '';
    this.advance(); // Skip opening quote
    
    while (this.currentChar && this.currentChar !== '"') {
      result += this.currentChar;
      this.advance();
    }
    
    this.advance(); // Skip closing quote
    return { type: 'STRING', value: result };
  }

  getNextToken() {
    while (this.currentChar) {
        if (/\s/.test(this.currentChar)) {
            this.skipWhitespace();
            continue;
        }
          
        if (/\d/.test(this.currentChar)) {
            return this.number();
        }
          
          // This is the critical part - make sure identifiers are handled correctly
        if (/[a-zA-Z_]/.test(this.currentChar)) {
            return this.identifier();
        }
      
      if (this.currentChar === '"') {
        return this.string();
      }
      
      if (this.currentChar === '+') {
        this.advance();
        return { type: 'PLUS', value: '+' };
      }
      
      if (this.currentChar === '-') {
        this.advance();
        return { type: 'MINUS', value: '-' };
      }
      
      if (this.currentChar === '*') {
        this.advance();
        return { type: 'MULTIPLY', value: '*' };
      }
      
      if (this.currentChar === '/') {
        this.advance();
        return { type: 'DIVIDE', value: '/' };
      }
      
      if (this.currentChar === '=') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: 'EQUALS', value: '==' };
        }
        return { type: 'ASSIGN', value: '=' };
      }
      
      if (this.currentChar === '>') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: 'GTE', value: '>=' };
        }
        return { type: 'GT', value: '>' };
      }
      
      if (this.currentChar === '<') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: 'LTE', value: '<=' };
        }
        return { type: 'LT', value: '<' };
      }
      
      if (this.currentChar === '!') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: 'NOT_EQUALS', value: '!=' };
        }
      }
      
      if (this.currentChar === '(') {
        this.advance();
        return { type: 'LPAREN', value: '(' };
      }
      
      if (this.currentChar === ')') {
        this.advance();
        return { type: 'RPAREN', value: ')' };
      }
      
      if (this.currentChar === '{') {
        this.advance();
        return { type: 'LBRACE', value: '{' };
      }
      
      if (this.currentChar === '}') {
        this.advance();
        return { type: 'RBRACE', value: '}' };
      }
      
      if (this.currentChar === ';') {
        this.advance();
        return { type: 'SEMICOLON', value: ';' };
      }
      
      if (this.currentChar === ',') {
        this.advance();
        return { type: 'COMMA', value: ',' };
      }
      
      if (this.currentChar === '%') {
        this.advance();
        return { type: 'MODULO', value: '%' };
      }
      
      if (this.currentChar === '&' && this.input[this.position + 1] === '&') {
        this.advance();
        this.advance();
        return { type: 'AND', value: '&&' };
      }
      
      if (this.currentChar === '|' && this.input[this.position + 1] === '|') {
        this.advance();
        this.advance();
        return { type: 'OR', value: '||' };
      }
        console.error(`Unrecognized character: '${this.currentChar}' at position ${this.position}`);
        console.error(`Context: "${this.input.substring(Math.max(0, this.position - 10), Math.min(this.input.length, this.position + 10))}"`);
      throw new Error(`Invalid character: ${this.currentChar}`);
    }
    
    return { type: 'EOF', value: null };
  }

  tokenize() {
    const tokens = [];
    let token = this.getNextToken();
    
    while (token.type !== 'EOF') {
      tokens.push(token);
      token = this.getNextToken();
    }
    
    tokens.push(token);
    return tokens;
  }
}

// Parser - Converts tokens into an Abstract Syntax Tree (AST)
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = this.tokens[this.position];
  }

  advance() {
    this.position++;
    if (this.position < this.tokens.length) {
      this.currentToken = this.tokens[this.position];
    } else {
      this.currentToken = null;
    }
  }

  eat(tokenType) {
    if (this.currentToken && this.currentToken.type === tokenType) {
      const token = this.currentToken;
      this.advance();
      return token;
    } else {
      throw new Error(`Expected ${tokenType} but got ${this.currentToken?.type}`);
    }
  }

  program() {
    const statements = [];
    
    while (this.currentToken && this.currentToken.type !== 'EOF') {
      statements.push(this.statement());
    }
    
    return { type: 'Program', body: statements };
  }

  statement() {
    if (this.currentToken.type === 'LET') {
      return this.variableDeclaration();
    } else if (this.currentToken.type === 'IF') {
      return this.ifStatement();
    } else if (this.currentToken.type === 'WHILE') {
      return this.whileStatement();
    } else if (this.currentToken.type === 'FUNCTION') {
      return this.functionDeclaration();
    } else if (this.currentToken.type === 'RETURN') {
      return this.returnStatement();
    } else if (this.currentToken.type === 'PRINT') {
      return this.printStatement();
    } else if (this.currentToken.type === 'IDENTIFIER') {
      const identifier = this.eat('IDENTIFIER');
      
      if (this.currentToken.type === 'ASSIGN') {
        this.eat('ASSIGN');
        const value = this.expression();
        this.eat('SEMICOLON');
        return { type: 'AssignmentExpression', name: identifier.value, value };
      } else if (this.currentToken.type === 'LPAREN') {
        const args = this.functionCall(identifier.value);
        this.eat('SEMICOLON');
        return args;
      }
    } else if (this.currentToken.type === 'LBRACE') {
      return this.blockStatement();
    }
    
    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }

  blockStatement() {
    this.eat('LBRACE');
    const body = [];
    
    while (this.currentToken && this.currentToken.type !== 'RBRACE') {
      body.push(this.statement());
    }
    
    this.eat('RBRACE');
    return { type: 'BlockStatement', body };
  }

  variableDeclaration() {
    this.eat('LET');
    const name = this.eat('IDENTIFIER').value;
    this.eat('ASSIGN');
    const value = this.expression();
    this.eat('SEMICOLON');
    
    return { type: 'VariableDeclaration', name, value };
  }

  ifStatement() {
    this.eat('IF');
    this.eat('LPAREN');
    const test = this.expression();
    this.eat('RPAREN');
    const consequent = this.statement();
    
    let alternate = null;
    if (this.currentToken && this.currentToken.type === 'ELSE') {
      this.eat('ELSE');
      alternate = this.statement();
    }
    
    return { type: 'IfStatement', test, consequent, alternate };
  }

  whileStatement() {
    this.eat('WHILE');
    this.eat('LPAREN');
    const test = this.expression();
    this.eat('RPAREN');
    const body = this.statement();
    
    return { type: 'WhileStatement', test, body };
  }

  functionDeclaration() {
    this.eat('FUNCTION');
    const name = this.eat('IDENTIFIER').value;
    this.eat('LPAREN');
    
    const params = [];
    if (this.currentToken.type !== 'RPAREN') {
      params.push(this.eat('IDENTIFIER').value);
      
      while (this.currentToken.type === 'COMMA') {
        this.eat('COMMA');
        params.push(this.eat('IDENTIFIER').value);
      }
    }
    
    this.eat('RPAREN');
    const body = this.statement();
    
    return { type: 'FunctionDeclaration', name, params, body };
  }

  functionCall(name) {
    this.eat('LPAREN');
    
    const args = [];
    if (this.currentToken.type !== 'RPAREN') {
      args.push(this.expression());
      
      while (this.currentToken.type === 'COMMA') {
        this.eat('COMMA');
        args.push(this.expression());
      }
    }
    
    this.eat('RPAREN');
    
    return { type: 'CallExpression', name, arguments: args };
  }

  returnStatement() {
    this.eat('RETURN');
    const argument = this.expression();
    this.eat('SEMICOLON');
    
    return { type: 'ReturnStatement', argument };
  }

  printStatement() {
    this.eat('PRINT');
    this.eat('LPAREN');
    const argument = this.expression();
    this.eat('RPAREN');
    this.eat('SEMICOLON');
    
    return { type: 'PrintStatement', argument };
  }

  expression() {
    return this.logicalOr();
  }

  logicalOr() {
    let left = this.logicalAnd();
    
    while (this.currentToken && this.currentToken.type === 'OR') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.logicalAnd();
      left = { type: 'LogicalExpression', operator, left, right };
    }
    
    return left;
  }

  logicalAnd() {
    let left = this.equality();
    
    while (this.currentToken && this.currentToken.type === 'AND') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.equality();
      left = { type: 'LogicalExpression', operator, left, right };
    }
    
    return left;
  }

  equality() {
    let left = this.comparison();
    
    while (
      this.currentToken && 
      (this.currentToken.type === 'EQUALS' || this.currentToken.type === 'NOT_EQUALS')
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.comparison();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  comparison() {
    let left = this.addition();
    
    while (
      this.currentToken && 
      (this.currentToken.type === 'GT' || 
       this.currentToken.type === 'GTE' || 
       this.currentToken.type === 'LT' || 
       this.currentToken.type === 'LTE')
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.addition();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  addition() {
    let left = this.multiplication();
    
    while (
      this.currentToken && 
      (this.currentToken.type === 'PLUS' || this.currentToken.type === 'MINUS')
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.multiplication();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  multiplication() {
    let left = this.primary();
    
    while (
      this.currentToken && 
      (this.currentToken.type === 'MULTIPLY' || 
       this.currentToken.type === 'DIVIDE' || 
       this.currentToken.type === 'MODULO')
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.primary();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  primary() {
    if (this.currentToken.type === 'NUMBER') {
      return { type: 'Literal', value: this.eat('NUMBER').value };
    } else if (this.currentToken.type === 'STRING') {
      return { type: 'Literal', value: this.eat('STRING').value };
    } else if (this.currentToken.type === 'TRUE') {
      this.eat('TRUE');
      return { type: 'Literal', value: true };
    } else if (this.currentToken.type === 'FALSE') {
      this.eat('FALSE');
      return { type: 'Literal', value: false };
    } else if (this.currentToken.type === 'IDENTIFIER') {
      const identifier = this.eat('IDENTIFIER');
      
      if (this.currentToken && this.currentToken.type === 'LPAREN') {
        return this.functionCall(identifier.value);
      }
      
      return { type: 'Identifier', name: identifier.value };
    } else if (this.currentToken.type === 'LPAREN') {
      this.eat('LPAREN');
      const expr = this.expression();
      this.eat('RPAREN');
      return expr;
    }
    
    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }

  parse() {
    return this.program();
  }
}

// Interpreter - Executes the AST
class Interpreter {
  constructor() {
    this.globalScope = {};
    this.scope = [this.globalScope];
    this.returnValue = null;
  }

  getCurrentScope() {
    return this.scope[this.scope.length - 1];
  }

  evaluate(node) {
    switch (node.type) {
      case 'Program':
        return this.evaluateProgram(node);
      case 'BlockStatement':
        return this.evaluateBlockStatement(node);
      case 'VariableDeclaration':
        return this.evaluateVariableDeclaration(node);
      case 'AssignmentExpression':
        return this.evaluateAssignmentExpression(node);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(node);
      case 'LogicalExpression':
        return this.evaluateLogicalExpression(node);
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.evaluateIdentifier(node);
      case 'IfStatement':
        return this.evaluateIfStatement(node);
      case 'WhileStatement':
        return this.evaluateWhileStatement(node);
      case 'FunctionDeclaration':
        return this.evaluateFunctionDeclaration(node);
      case 'CallExpression':
        return this.evaluateCallExpression(node);
      case 'ReturnStatement':
        return this.evaluateReturnStatement(node);
      case 'PrintStatement':
        return this.evaluatePrintStatement(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  evaluateProgram(node) {
    let result;
    
    for (const statement of node.body) {
      result = this.evaluate(statement);
      
      if (this.returnValue !== null) {
        const temp = this.returnValue;
        this.returnValue = null;
        return temp;
      }
    }
    
    return result;
  }

  evaluateBlockStatement(node) {
    this.scope.push({});
    
    let result;
    for (const statement of node.body) {
      result = this.evaluate(statement);
      
      if (this.returnValue !== null) {
        break;
      }
    }
    
    this.scope.pop();
    return result;
  }

  evaluateVariableDeclaration(node) {
    const value = this.evaluate(node.value);
    this.getCurrentScope()[node.name] = value;
    return value;
  }

  evaluateAssignmentExpression(node) {
    const value = this.evaluate(node.value);
    
    for (let i = this.scope.length - 1; i >= 0; i--) {
      if (node.name in this.scope[i]) {
        this.scope[i][node.name] = value;
        return value;
      }
    }
    
    throw new Error(`Variable ${node.name} is not defined`);
  }

  evaluateBinaryExpression(node) {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    
    switch (node.operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  evaluateLogicalExpression(node) {
    const left = this.evaluate(node.left);
    
    if (node.operator === '&&') {
      return left ? this.evaluate(node.right) : left;
    } else if (node.operator === '||') {
      return left ? left : this.evaluate(node.right);
    }
    
    throw new Error(`Unknown logical operator: ${node.operator}`);
  }

  evaluateIdentifier(node) {
    for (let i = this.scope.length - 1; i >= 0; i--) {
      if (node.name in this.scope[i]) {
        return this.scope[i][node.name];
      }
    }
    
    throw new Error(`Variable ${node.name} is not defined`);
  }

  evaluateIfStatement(node) {
    const test = this.evaluate(node.test);
    
    if (test) {
      return this.evaluate(node.consequent);
    } else if (node.alternate) {
      return this.evaluate(node.alternate);
    }
    
    return null;
  }

  evaluateWhileStatement(node) {
    let result;
    
    while (this.evaluate(node.test)) {
      result = this.evaluate(node.body);
      
      if (this.returnValue !== null) {
        break;
      }
    }
    
    return result;
  }

  evaluateFunctionDeclaration(node) {
    const func = {
      type: 'function',
      name: node.name,
      params: node.params,
      body: node.body,
      scope: [...this.scope]
    };
    
    this.getCurrentScope()[node.name] = func;
    return func;
  }

  evaluateCallExpression(node) {
    let func;
    
    for (let i = this.scope.length - 1; i >= 0; i--) {
      if (node.name in this.scope[i]) {
        func = this.scope[i][node.name];
        break;
      }
    }
    
    if (!func || func.type !== 'function') {
      throw new Error(`${node.name} is not a function`);
    }
    
    const args = node.arguments.map(arg => this.evaluate(arg));
    const previousScope = this.scope;
    
    this.scope = [...func.scope];
    this.scope.push({});
    
    for (let i = 0; i < func.params.length; i++) {
      this.getCurrentScope()[func.params[i]] = args[i];
    }
    
    const result = this.evaluate(func.body);
    this.scope = previousScope;
    
    if (this.returnValue !== null) {
      const temp = this.returnValue;
      this.returnValue = null;
      return temp;
    }
    
    return result;
  }

  evaluateReturnStatement(node) {
    this.returnValue = this.evaluate(node.argument);
    return this.returnValue;
  }

  evaluatePrintStatement(node) {
    const value = this.evaluate(node.argument);
    console.log(value);
    return value;
  }
}

// Main function to run the interpreter
function runInterpreter(code) {
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const interpreter = new Interpreter();
    interpreter.evaluate(ast);
    
    return { success: true };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Command-line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: simplelang <filename.as>');
    process.exit(1);
  }
  
  const filename = args[0];
  
  try {
    const code = fs.readFileSync(filename, 'utf8');
    console.log(`Running ${filename}...\n`);
    runInterpreter(code);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: File '${filename}' not found.`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run the CLI
main();