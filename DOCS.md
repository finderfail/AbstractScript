# AbstractScript Documentation

## Overview

The AbstractScript is a simple scripting language with interpreter written in JavaScript. It supports basic operations such as variable declaration, printing, conditional statements, and loops. This documentation provides an overview of the language syntax and usage.

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Create project:
   ```sh
   npm init -y
   ```

2. Install the interpreter:
   ```sh
   npm install abstractscript
   ```
   or install globally
   ```sh
   npm install -g abstractscript 
   ```

### Usage

To run the interpreter, use the following command in package.json:
```sh
"start": "asc index.as"
```

For example:
```sh
npm run start
```
or if you installed globally
```sh
asc index.as
```

## Language Syntax

### Variable Declaration

Declare variables using the `let` keyword:
```asc
let variableName = value;
```

Example:
```asc
let x = 10;
let y = "Hello, World!";
```

### Printing

Print values using the `print` keyword:
```asc
print expression;
```

Example:
```asc
print x;
print "Hello, World!";
```

### Conditional Statements

Use `if` statements for conditional execution:
```asc
if condition { trueBlock } else { falseBlock }
```

Example:
```asc
if x == 10 { print "x is 10"; } else { print "x is not 10"; }
```

### Loops

Use `while` loops for iterative execution:
```asc
while condition { block }
```

Example:
```asc
while x < 10 { print x; x = x + 1; }
```

### Operators

Supported operators include:
- Arithmetic: `+`, `-`, `*`, `/`, `^`
- Comparison: `==`

### Comments

Comments are not supported in the current version.

## Examples

### Example 1: Variable Declaration and Printing

```asc
let x = 10;
print x;
```

### Example 2: Conditional Statement

```asc
let x = 5;
if x == 5 { print "x is 5"; } else { print "x is not 5"; }
```

### Example 3: Loop

```asc
let x = 0;
while x < 5 { print x; x = x + 1; }
```
