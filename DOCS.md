# AbstractScript Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Language Syntax](#language-syntax)
4. [Data Types](#data-types)
5. [Variables](#variables)
6. [Operators](#operators)
7. [Control Flow](#control-flow)
8. [Functions](#functions)
9. [Built-in Functions](#built-in-functions)
10. [Command-line Usage](#command-line-usage)
11. [Examples](#examples)

## Introduction

AbstractScript is a lightweight, interpreted programming language designed for simplicity and ease of learning. It features a JavaScript-like syntax with support for variables, functions, control flow, and basic operations. AbstractScript is implemented in JavaScript and can be run from the command line.

## Getting Started

### Installation

1. Save the AbstractScript interpreter as `asc.js`
2. Make it executable: `chmod +x asc.js`
3. Create a script file with the `.as` extension
4. Run your script: `node asc.js yourscript.as`

### Your First AbstractScript Program

Create a file named `hello.as` with the following content:

print("Hello world");
```plaintext

Run it with:

```bash
node asc.js hello.as
```

## Language Syntax

AbstractScript uses a C-style syntax with semicolons to terminate statements and curly braces to define blocks.

### Comments

Single-line comments start with `//`:

```plaintext
// This is a comment
print("Hello"); // This is also a comment
```

### Statements

Each statement must end with a semicolon:

```plaintext
let x = 10;
print(x);
```

### Code Blocks

Code blocks are enclosed in curly braces:

```plaintext
if (x > 5) {
  print("x is greater than 5");
}
```

## Data Types

AbstractScript supports the following data types:

### Numbers

Numbers can be integers or floating-point:

```plaintext
let integer = 42;
let float = 3.14;
```

### Strings

Strings are enclosed in double quotes:

```plaintext
let message = "Hello, AbstractScript!";
```

### Booleans

Boolean values are `true` or `false`:

```plaintext
let isActive = true;
let isComplete = false;
```

## Variables

### Declaration and Assignment

Variables are declared using the `let` keyword:

```plaintext
let name = "John";
let age = 30;
```

### Variable Scope

Variables have block scope. Variables declared inside a block are only accessible within that block:

```plaintext
let x = 10;

if (true) {
  let y = 20; // Only accessible within this block
  print(x);   // 10
  print(y);   // 20
}

print(x);     // 10
print(y);  // Error: y is not defined
```

## Operators

### Arithmetic Operators

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Modulo (remainder): `%`


```plaintext
let sum = 5 + 3;        // 8
let difference = 10 - 4; // 6
let product = 3 * 4;     // 12
let quotient = 10 / 2;   // 5
let remainder = 10 % 3;  // 1
```

### Comparison Operators

- Equal to: `==`
- Not equal to: `!=`
- Greater than: `>`
- Less than: `<`
- Greater than or equal to: `>=`
- Less than or equal to: `<=`


```plaintext
let isEqual = 5 == 5;      // true
let isNotEqual = 5 != 3;   // true
let isGreater = 10 > 5;    // true
let isLess = 3 &lt; 7;        // true
let isGreaterOrEqual = 5 >= 5; // true
let isLessOrEqual = 4 <= 3;    // false
```

### Logical Operators

- Logical AND: `&&`
- Logical OR: `||`


```plaintext
let result1 = true && false; // false
let result2 = true || false; // true
```

### String Concatenation

The `+` operator can be used to concatenate strings:

```plaintext
let firstName = "John";
let lastName = "Doe";
let fullName = firstName + " " + lastName; // "John Doe"
```

## Control Flow

### Conditional Statements

AbstractScript supports `if`, `else if`, and `else` statements:

```plaintext
let age = 18;

if (age >= 18) {
  print("You are an adult");
} else if (age >= 13) {
  print("You are a teenager");
} else {
  print("You are a child");
}
```

### While Loops

AbstractScript supports `while` loops:

```plaintext
let i = 1;
while (i <= 5) {
  print(i);
  i = i + 1;
}
```

## Functions

### Function Declaration

Functions are declared using the `function` keyword:

```plaintext
function greet(name) {
  return "Hello, " + name + "!";
}
```

### Function Calls

Functions are called by name with arguments in parentheses:

```plaintext
let message = greet("John");
print(message); // "Hello, John!"
```

### Return Values

Functions can return values using the `return` statement:

```plaintext
function add(a, b) {
  return a + b;
}

let sum = add(3, 4);
print(sum); // 7
```

### Recursive Functions

AbstractScript supports recursive functions:

```plaintext
function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

print(factorial(5)); // 120
```

## Built-in Functions

### print()

The `print()` function outputs values to the console:

```plaintext
print("Hello, world!");
print(42);
print(true);
```

## Command-line Usage

Run AbstractScript scripts from the command line:

```shellscript
node asc.js <filename.as>
```