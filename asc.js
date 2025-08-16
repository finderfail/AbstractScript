#!/usr/bin/env node
import fs from "fs";
import path from "path";

// ---------------- Lexer ----------------
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[this.position];
    this.keywords = [
      "let", "if", "else", "while", "function",
      "return", "true", "false", "print", "import"
    ];
  }

  advance() {
    this.position++;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) this.advance();
  }

  number() {
    let result = "";
    while (this.currentChar && /\d/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    if (this.currentChar === ".") {
      result += ".";
      this.advance();
      while (this.currentChar && /\d/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      return { type: "NUMBER", value: parseFloat(result) };
    }
    return { type: "NUMBER", value: parseInt(result) };
  }

  identifier() {
    let result = "";
    while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    if (this.keywords.includes(result)) {
      return { type: result.toUpperCase(), value: result };
    }
    return { type: "IDENTIFIER", value: result };
  }

  string() {
    let result = "";
    this.advance();
    while (this.currentChar && this.currentChar !== '"') {
      result += this.currentChar;
      this.advance();
    }
    this.advance();
    return { type: "STRING", value: result };
  }

  getNextToken() {
    while (this.currentChar) {
      if (/\s/.test(this.currentChar)) { this.skipWhitespace(); continue; }
      if (/\d/.test(this.currentChar)) return this.number();
      if (/[a-zA-Z_]/.test(this.currentChar)) return this.identifier();
      if (this.currentChar === '"') return this.string();

      const singleCharTokens = {
        "+": "PLUS", "-": "MINUS", "*": "MULTIPLY", "%": "MODULO",
        "(": "LPAREN", ")": "RPAREN", "{": "LBRACE", "}": "RBRACE",
        ";": "SEMICOLON", ",": "COMMA"
      };

      if (singleCharTokens[this.currentChar]) {
        const token = { type: singleCharTokens[this.currentChar], value: this.currentChar };
        this.advance();
        return token;
      }

      if (this.currentChar === "/") {
        this.advance();
        if (this.currentChar === "/") {
          while (this.currentChar && this.currentChar !== "\n") this.advance();
          continue;
        }
        return { type: "DIVIDE", value: "/" };
      }

      if (this.currentChar === "=") {
        this.advance();
        if (this.currentChar === "=") { this.advance(); return { type: "EQUALS", value: "==" }; }
        return { type: "ASSIGN", value: "=" };
      }

      if (this.currentChar === ">") {
        this.advance();
        if (this.currentChar === "=") { this.advance(); return { type: "GTE", value: ">=" }; }
        return { type: "GT", value: ">" };
      }

      if (this.currentChar === "<") {
        this.advance();
        if (this.currentChar === "=") { this.advance(); return { type: "LTE", value: "<=" }; }
        return { type: "LT", value: "<" };
      }

      if (this.currentChar === "!") {
        this.advance();
        if (this.currentChar === "=") { this.advance(); return { type: "NOT_EQUALS", value: "!=" }; }
      }

      if (this.currentChar === "&" && this.input[this.position + 1] === "&") {
        this.advance(); this.advance();
        return { type: "AND", value: "&&" };
      }

      if (this.currentChar === "|" && this.input[this.position + 1] === "|") {
        this.advance(); this.advance();
        return { type: "OR", value: "||" };
      }

      if (this.currentChar === "\n" || this.currentChar === "\r") {
        this.advance();
        continue;
      }

      throw new Error(`Invalid character: ${this.currentChar}`);
    }
    return { type: "EOF", value: null };
  }

  tokenize() {
    const tokens = [];
    let token = this.getNextToken();
    while (token.type !== "EOF") {
      tokens.push(token);
      token = this.getNextToken();
    }
    tokens.push(token);
    return tokens;
  }
}

// ---------------- Parser (AST builder) ----------------
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = this.tokens[this.position];
  }

  advance() {
    this.position++;
    this.currentToken = this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  eat(type) {
    if (this.currentToken && this.currentToken.type === type) {
      const token = this.currentToken;
      this.advance();
      return token;
    }
    throw new Error(`Expected ${type}, got ${this.currentToken?.type}`);
  }

  program() {
    const statements = [];
    while (this.currentToken && this.currentToken.type !== "EOF") {
      statements.push(this.statement());
    }
    return { type: "Program", body: statements };
  }

  statement() {
    if (this.currentToken.type === "LET") return this.variableDeclaration();
    if (this.currentToken.type === "IF") return this.ifStatement();
    if (this.currentToken.type === "WHILE") return this.whileStatement();
    if (this.currentToken.type === "FUNCTION") return this.functionDeclaration();
    if (this.currentToken.type === "RETURN") return this.returnStatement();
    if (this.currentToken.type === "PRINT") return this.printStatement();
    if (this.currentToken.type === "IMPORT") return this.importStatement();
    if (this.currentToken.type === "IDENTIFIER") {
      const id = this.eat("IDENTIFIER");
      if (this.currentToken.type === "ASSIGN") {
        this.eat("ASSIGN");
        const value = this.expression();
        this.eat("SEMICOLON");
        return { type: "AssignmentExpression", name: id.value, value };
      } else if (this.currentToken.type === "LPAREN") {
        const call = this.functionCall(id.value);
        this.eat("SEMICOLON");
        return call;
      }
    }
    if (this.currentToken.type === "LBRACE") return this.blockStatement();
    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }

  blockStatement() {
    this.eat("LBRACE");
    const body = [];
    while (this.currentToken && this.currentToken.type !== "RBRACE") {
      body.push(this.statement());
    }
    this.eat("RBRACE");
    return { type: "BlockStatement", body };
  }

  variableDeclaration() {
    this.eat("LET");
    const name = this.eat("IDENTIFIER").value;
    this.eat("ASSIGN");
    const value = this.expression();
    this.eat("SEMICOLON");
    return { type: "VariableDeclaration", name, value };
  }

  ifStatement() {
    this.eat("IF"); this.eat("LPAREN");
    const test = this.expression();
    this.eat("RPAREN");
    const consequent = this.statement();
    let alternate = null;
    if (this.currentToken && this.currentToken.type === "ELSE") {
      this.eat("ELSE");
      alternate = this.statement();
    }
    return { type: "IfStatement", test, consequent, alternate };
  }

  whileStatement() {
    this.eat("WHILE"); this.eat("LPAREN");
    const test = this.expression();
    this.eat("RPAREN");
    const body = this.statement();
    return { type: "WhileStatement", test, body };
  }

  functionDeclaration() {
    this.eat("FUNCTION");
    const name = this.eat("IDENTIFIER").value;
    this.eat("LPAREN");
    const params = [];
    if (this.currentToken.type !== "RPAREN") {
      params.push(this.eat("IDENTIFIER").value);
      while (this.currentToken.type === "COMMA") {
        this.eat("COMMA");
        params.push(this.eat("IDENTIFIER").value);
      }
    }
    this.eat("RPAREN");
    const body = this.statement();
    return { type: "FunctionDeclaration", name, params, body };
  }

  functionCall(name) {
    this.eat("LPAREN");
    const args = [];
    if (this.currentToken.type !== "RPAREN") {
      args.push(this.expression());
      while (this.currentToken.type === "COMMA") {
        this.eat("COMMA");
        args.push(this.expression());
      }
    }
    this.eat("RPAREN");
    return { type: "CallExpression", name, arguments: args };
  }

  returnStatement() {
    this.eat("RETURN");
    const arg = this.expression();
    this.eat("SEMICOLON");
    return { type: "ReturnStatement", argument: arg };
  }

  printStatement() {
    this.eat("PRINT"); this.eat("LPAREN");
    const arg = this.expression();
    this.eat("RPAREN"); this.eat("SEMICOLON");
    return { type: "PrintStatement", argument: arg };
  }

  importStatement() {
    this.eat("IMPORT"); this.eat("LPAREN");
    const file = this.eat("STRING").value;
    this.eat("RPAREN"); this.eat("SEMICOLON");
    return { type: "ImportStatement", path: file };
  }

  expression() { return this.logicalOr(); }
  logicalOr() {
    let left = this.logicalAnd();
    while (this.currentToken && this.currentToken.type === "OR") {
      const op = this.currentToken.value;
      this.advance();
      const right = this.logicalAnd();
      left = { type: "LogicalExpression", operator: op, left, right };
    }
    return left;
  }
  logicalAnd() {
    let left = this.equality();
    while (this.currentToken && this.currentToken.type === "AND") {
      const op = this.currentToken.value;
      this.advance();
      const right = this.equality();
      left = { type: "LogicalExpression", operator: op, left, right };
    }
    return left;
  }
  equality() {
    let left = this.comparison();
    while (this.currentToken && ["EQUALS", "NOT_EQUALS"].includes(this.currentToken.type)) {
      const op = this.currentToken.value;
      this.advance();
      const right = this.comparison();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }
  comparison() {
    let left = this.addition();
    while (this.currentToken && ["GT", "GTE", "LT", "LTE"].includes(this.currentToken.type)) {
      const op = this.currentToken.value;
      this.advance();
      const right = this.addition();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }
  addition() {
    let left = this.multiplication();
    while (this.currentToken && ["PLUS", "MINUS"].includes(this.currentToken.type)) {
      const op = this.currentToken.value;
      this.advance();
      const right = this.multiplication();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }
  multiplication() {
    let left = this.primary();
    while (this.currentToken && ["MULTIPLY", "DIVIDE", "MODULO"].includes(this.currentToken.type)) {
      const op = this.currentToken.value;
      this.advance();
      const right = this.primary();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }
  primary() {
    if (this.currentToken.type === "NUMBER") return { type: "Literal", value: this.eat("NUMBER").value };
    if (this.currentToken.type === "STRING") return { type: "Literal", value: this.eat("STRING").value };
    if (this.currentToken.type === "TRUE") { this.eat("TRUE"); return { type: "Literal", value: true }; }
    if (this.currentToken.type === "FALSE") { this.eat("FALSE"); return { type: "Literal", value: false }; }
    if (this.currentToken.type === "IDENTIFIER") {
      const id = this.eat("IDENTIFIER");
      if (this.currentToken && this.currentToken.type === "LPAREN") return this.functionCall(id.value);
      return { type: "Identifier", name: id.value };
    }
    if (this.currentToken.type === "LPAREN") {
      this.eat("LPAREN");
      const expr = this.expression();
      this.eat("RPAREN");
      return expr;
    }
    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }
  parse() { return this.program(); }
}

class CodeGenerator {
  constructor(baseDir, sharedState = null) {
    this.baseDir = baseDir;
    // sharedState: {
    //   compiled: Set(absPaths),
    //   compilingStack: Array(absPaths),
    //   projectRoot: absPath,
    //   outDir: absPath,
    //   compileFile: function
    // }
    this.sharedState = sharedState || {
      compiled: new Set(),
      compilingStack: [],
      projectRoot: process.cwd(),
      outDir: path.resolve(process.cwd(), "dist"),
      compileFile: null
    };
  }

  generate(node) {
    switch (node.type) {
      case "Program":
        return node.body.map(s => this.generate(s)).join("\n");
      case "BlockStatement":
        return `{\n${node.body.map(s => this.generate(s)).join("\n")}\n}`;
      case "VariableDeclaration":
        return `let ${node.name} = ${this.generate(node.value)};`;
      case "AssignmentExpression":
        return `${node.name} = ${this.generate(node.value)};`;
      case "BinaryExpression":
        return `(${this.generate(node.left)} ${node.operator} ${this.generate(node.right)})`;
      case "LogicalExpression":
        return `(${this.generate(node.left)} ${node.operator} ${this.generate(node.right)})`;
      case "Literal":
        return JSON.stringify(node.value);
      case "Identifier":
        return node.name;
      case "IfStatement":
        return `if (${this.generate(node.test)}) ${this.generate(node.consequent)}${node.alternate ? ` else ${this.generate(node.alternate)}` : ""}`;
      case "WhileStatement":
        return `while (${this.generate(node.test)}) ${this.generate(node.body)}`;
      case "FunctionDeclaration":
        return `function ${node.name}(${node.params.join(", ")}) ${this.generate(node.body)}`;
      case "CallExpression":
        return `${node.name}(${node.arguments.map(a => this.generate(a)).join(", ")})`;
      case "ReturnStatement":
        return `return ${this.generate(node.argument)};`;
      case "PrintStatement":
        return `console.log(${this.generate(node.argument)});`;
      case "ImportStatement":
        return this.handleImport(node.path);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  handleImport(importPath) {
    // Resolve path relative to current baseDir
    const fullPath = path.resolve(this.baseDir, importPath);

    // Cycle detection: if currently being compiled up the chain
    if (this.sharedState.compilingStack.includes(fullPath)) {
      console.warn(`⚠️ Cyclic import detected (skipping inline): ${fullPath}`);
      return `/* cyclic import skipped: ${path.relative(this.sharedState.projectRoot, fullPath)} */`;
    }

    // If already compiled earlier, we still will try to inline its generated code (read from outDir if possible)
    // But first, ensure it's compiled/write to outDir (so project has the file)
    if (typeof this.sharedState.compileFile === "function") {
      // compileFile will compile+write the imported file (and return its generated JS)
      try {
        const childJs = this.sharedState.compileFile(fullPath);
        // Inline the child's code into the parent as well (keeps behavior similar to previous version)
        return childJs || `/* imported ${path.basename(fullPath)} */`;
      } catch (err) {
        throw new Error(`Error compiling import ${importPath}: ${err.message}`);
      }
    } else {
      // Fallback: read file and generate inline, but do not write separate file
      if (!fs.existsSync(fullPath)) throw new Error(`Imported file not found: ${importPath}`);
      const code = fs.readFileSync(fullPath, "utf8");
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const childGenerator = new CodeGenerator(path.dirname(fullPath), this.sharedState);
      return childGenerator.generate(ast);
    }
  }
}

// ---------------- Transpiler ----------------
function transpile(code, baseDir = process.cwd(), sharedState = null) {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new CodeGenerator(baseDir, sharedState);
  return generator.generate(ast);
}

// ---------------- Helpers: file discovery (simple include support) ----------------
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, fileList);
    } else if (entry.isFile()) {
      fileList.push(full);
    }
  }
  return fileList;
}

function matchIncludePatterns(rootDir, patterns) {
  // Very small subset: support "**/*.as" and "*.as" (no full glob library)
  const allFiles = walkDir(rootDir);
  const matched = new Set();
  for (const pat of patterns) {
    if (pat === "**/*.as" || pat === "**/*.AS") {
      for (const f of allFiles) if (f.endsWith(".as")) matched.add(f);
    } else if (pat.endsWith("/*.as")) {
      const folder = pat.slice(0, -("/*.as".length));
      const fullFolder = path.resolve(rootDir, folder);
      if (fs.existsSync(fullFolder) && fs.statSync(fullFolder).isDirectory()) {
        const entries = fs.readdirSync(fullFolder);
        for (const e of entries) {
          const full = path.join(fullFolder, e);
          if (full.endsWith(".as")) matched.add(full);
        }
      }
    } else if (pat === "*.as") {
      const entries = fs.readdirSync(rootDir);
      for (const e of entries) {
        const full = path.join(rootDir, e);
        if (full.endsWith(".as")) matched.add(full);
      }
    } else {
      // direct file path relative to rootDir
      const candidate = path.resolve(rootDir, pat);
      if (fs.existsSync(candidate) && candidate.endsWith(".as")) matched.add(candidate);
    }
  }
  return [...matched];
}

// ---------------- Build logic ----------------
/*
sharedState:
  compiled: Set of absolute source paths already compiled/written
  compilingStack: current recursion stack (for cycle detection)
  projectRoot: absolute path used to compute relative outputs
  outDir: absolute path to place generated JS files
  compileFile: function that compiles a given absolute .as path and returns its JS string
*/
function compileAndWrite(filePath, sharedState) {
  const fullPath = path.resolve(filePath);

  // if already compiled, return its JS content (from outDir) if exists
  if (sharedState.compiled.has(fullPath)) {
    // try to read the already-written output
    const rel = path.relative(sharedState.projectRoot, fullPath);
    const outFile = path.join(sharedState.outDir, rel).replace(/\.as$/, ".js");
    if (fs.existsSync(outFile)) {
      return fs.readFileSync(outFile, "utf8");
    }
    return ""; // nothing to return
  }

  if (sharedState.compilingStack.includes(fullPath)) {
    console.warn(`⚠️ Cyclic import detected while compiling: ${fullPath}`);
    return `/* cyclic import skipped: ${path.relative(sharedState.projectRoot, fullPath)} */`;
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  sharedState.compilingStack.push(fullPath);
  const code = fs.readFileSync(fullPath, "utf8");
  // transpile will call sharedState.compileFile for nested imports (we set that below)
  const jsCode = transpile(code, path.dirname(fullPath), sharedState);

  // mark compiled and write output preserving directory structure relative to projectRoot
  const rel = path.relative(sharedState.projectRoot, fullPath);
  const outFile = path.join(sharedState.outDir, rel).replace(/\.as$/, ".js");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, jsCode, "utf8");

  sharedState.compiled.add(fullPath);
  sharedState.compilingStack.pop();

  console.log(`Compiled: ${fullPath} → ${outFile}`);
  return jsCode;
}

function buildProjectFromConfig(configPath) {
  const configAbs = path.resolve(configPath);
  if (!fs.existsSync(configAbs)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(configAbs, "utf8");
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error(`Error parsing ${configPath}: ${err.message}`);
    process.exit(1);
  }

  const projectRoot = path.dirname(configAbs);
  const outDir = path.resolve(projectRoot, config.outDir || "dist");
  const rootDir = config.rootDir ? path.resolve(projectRoot, config.rootDir) : projectRoot;

  // determine source files:
  let sourceFiles = [];
  if (Array.isArray(config.files) && config.files.length > 0) {
    sourceFiles = config.files.map(p => path.resolve(projectRoot, p));
  } else if (Array.isArray(config.include) && config.include.length > 0) {
    sourceFiles = matchIncludePatterns(rootDir, config.include);
  } else {
    // fallback: collect all .as in rootDir
    const all = walkDir(rootDir).filter(f => f.endsWith(".as"));
    sourceFiles = all;
  }

  // prepare sharedState
  const sharedState = {
    compiled: new Set(),
    compilingStack: [],
    projectRoot,
    outDir,
    compileFile: null // filled below
  };

  // assign compileFile to allow CodeGenerator to request compilation of imports
  sharedState.compileFile = (absPath) => compileAndWrite(absPath, sharedState);

  // ensure outDir exists
  fs.mkdirSync(outDir, { recursive: true });

  // Compile each entry file (this will recursively compile imports)
  for (const f of sourceFiles) {
    try {
      compileAndWrite(f, sharedState);
    } catch (err) {
      console.error(`Error compiling ${f}: ${err.message}`);
    }
  }

  console.log(`\nBuild finished. Output in: ${outDir}`);
}

// ---------------- CLI ----------------
function createDefaultConfig(filename = "asconfig.json") {
  const defaultConfig = {
    rootDir: "src",
    outDir: "dist",
    include: ["**/*.as"]
  };

  if (fs.existsSync(filename)) {
    console.log(`⚠️  ${filename} already exists`);
    return;
  }

  fs.writeFileSync(filename, JSON.stringify(defaultConfig, null, 2), "utf8");
  console.log(`✅ ${filename} created`);
  console.log("Put your .as files into the rootDir (default: src/) and run `asc build` or `node asc.js build`");
}

function printUsage() {
  console.log(`Usage:
  asc init                # create asconfig.json with defaults
  asc build [config]      # build project using asconfig.json (default: ./asconfig.json)
  asc <file.as>           # compile single file (imports compiled "for company") into same-folder or outDir if config exists
`);
}

function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const configPath = path.join(cwd, "asconfig.json");

  if (args.length === 0) {
    // If asconfig.json exists do build otherwise show usage
    if (fs.existsSync(configPath)) {
      buildProjectFromConfig(configPath);
    } else {
      printUsage();
      process.exit(1);
    }
    return;
  }

  const cmd = args[0];

  if (cmd === "init") {
    createDefaultConfig(configPath);
    return;
  }

  if (cmd === "build") {
    const cfg = args[1] || configPath;
    buildProjectFromConfig(cfg);
    return;
  }

  // Otherwise, treat first arg as a single file to compile
  const inputFile = cmd;
  const absInput = path.resolve(inputFile);
  if (!fs.existsSync(absInput)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
  }

  // If asconfig.json exists, use its outDir, otherwise write next to input file
  let outDir = path.dirname(absInput);
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const projectRoot = path.dirname(configPath);
      outDir = path.resolve(projectRoot, cfg.outDir || "dist");
      fs.mkdirSync(outDir, { recursive: true });
    } catch (err) {
      console.warn(`Warning: failed to read asconfig.json: ${err.message}. Falling back to input directory.`);
    }
  }

  // prepare sharedState for single-file compile
  const projectRootSingle = path.dirname(absInput);
  const sharedState = {
    compiled: new Set(),
    compilingStack: [],
    projectRoot: projectRootSingle,
    outDir,
    compileFile: null
  };
  sharedState.compileFile = (absPath) => compileAndWrite(absPath, sharedState);

  try {
    compileAndWrite(absInput, sharedState);
    console.log("Done.");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
