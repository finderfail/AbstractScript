# ASC Interpreter Documentation

## Overview

The ASC Interpreter is a simple scripting language interpreter written in JavaScript. It supports basic operations such as variable declaration, printing, conditional statements, and loops. This documentation provides an overview of the language syntax and usage.

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```sh
   cd asc-interpreter
   ```

3. Install the dependencies:
   ```sh
   npm install
   ```

### Usage

To run the interpreter, use the following command:
```sh
node asc.js <path-to-code-file>
```

For example:
```sh
node asc.js test.as
```

### Help

To display the help message, use the `-h` flag:
```sh
node asc.js -h
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
