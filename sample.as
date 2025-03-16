print("=== AbstractScript Language Showcase ===");
print("This program demonstrates the key features and strengths of AbstractScript");
print("-------------------------------------------");

print("\n1. Variables and Data Types:");

let integer = 42;
let float = 3.14159;
print("  Numbers: " + integer + " and " + float);

let greeting = "Hello";
let name = "AbstractScript";
print("  Strings: " + greeting + ", " + name + "!");

let isAwesome = true;
let isBoring = false;
print("  Booleans: Language is awesome: " + isAwesome + ", Language is boring: " + isBoring);

print("\n2. Arithmetic Operations:");

let a = 10;
let b = 3;

print("  Addition: " + a + " + " + b + " = " + (a + b));
print("  Subtraction: " + a + " - " + b + " = " + (a - b));
print("  Multiplication: " + a + " * " + b + " = " + (a * b));
print("  Division: " + a + " / " + b + " = " + (a / b));
print("  Modulo: " + a + " % " + b + " = " + (a % b));

let complex = (a + b) * (a - b) / 2;
print("  Complex expression: (a + b) * (a - b) / 2 = " + complex);

print("\n3. String Operations:");

let fullGreeting = greeting + ", " + name + "!";
print("  Concatenation: " + fullGreeting);

let age = 1;
let description = "SimpleLang is " + age + " year old";
print("  Mixed concatenation: " + description);

print("\n4. Conditional Logic:");

if (a > b) {
  print("  a is greater than b");
}

let temperature = 75;
if (temperature > 80) {
  print("  It's hot outside!");
} else if (temperature > 60) {
  print("  It's nice outside!");
} else {
  print("  It's cold outside!");
}

let time = 14;
let isWeekend = true;

if (time < 12) {
  print("  Good morning!");
  if (isWeekend) {
    print("  Enjoy your weekend!");
  } else {
    print("  Have a productive day!");
  }
} else if (time < 18) {
  print("  Good afternoon!");
} else {
  print("  Good evening!");
}

print("\n5. Logical Operators:");

let sunny = true;
let warm = true;

if (sunny && warm) {
  print("  It's a perfect day for a picnic!");
}

if (sunny || warm) {
  print("  It's at least decent weather outside.");
}



print("\n6. Loops:");

print("  Counting from 1 to 5:");
let i = 1;
while (i <= 5) {
  print("    " + i);
  i = i + 1;
}

let sum = 0;
let j = 1;
while (j <= 10) {
  sum = sum + j;
  j = j + 1;
}
print("  Sum of numbers 1-10: " + sum);

print("  Triangle pattern:");
let row = 1;
while (row <= 5) {
  let pattern = "";
  let col = 1;
  while (col <= row) {
    pattern = pattern + "* ";
    col = col + 1;
  }
  print("    " + pattern);
  row = row + 1;
}

print("\n7. Functions:");

function greet(person) {
  return "Hello, " + person + "!";
}

print("  " + greet("User"));

function calculateArea(length, width) {
  return length * width;
}

let rectangleArea = calculateArea(5, 3);
print("  Area of 5×3 rectangle: " + rectangleArea);

function getLetterGrade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else if (score >= 60) {
    return "D";
  } else {
    return "F";
  }
}

print("  Grade for score 85: " + getLetterGrade(85));
print("  Grade for score 72: " + getLetterGrade(72));
print("  Grade for score 95: " + getLetterGrade(95));

print("\n8. Recursion:");

function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

print("  Factorial of 5: " + factorial(5));

function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

print("  First 8 Fibonacci numbers:");
let k = 0;
while (k < 8) {
  print("    fibonacci(" + k + ") = " + fibonacci(k));
  k = k + 1;
}

print("\n9. Advanced Examples:");

function isPrime(n) {
  if (n <= 1) {
    return false;
  }
  
  let divisor = 2;
  while (divisor * divisor <= n) {
    if (n % divisor == 0) {
      return false;
    }
    divisor = divisor + 1;
  }
  
  return true;
}

print("  Prime number check:");
print("    Is 7 prime? " + isPrime(7));
print("    Is 12 prime? " + isPrime(12));
print("    Is 23 prime? " + isPrime(23));

function gcd(a, b) {
  while (b != 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

print("  Greatest Common Divisor (GCD):");
print("    GCD of 48 and 18: " + gcd(48, 18));
print("    GCD of 17 and 5: " + gcd(17, 5));

function calculator(a, op, b) {
  if (op == "+") {
    return a + b;
  } else if (op == "-") {
    return a - b;
  } else if (op == "*") {
    return a * b;
  } else if (op == "/") {
    if (b == 0) {
      return "Error: Division by zero";
    }
    return a / b;
  } else if (op == "%") {
    return a % b;
  } else {
    return "Error: Unknown operator";
  }
}

print("  Calculator function:");
print("    10 + 5 = " + calculator(10, "+", 5));
print("    10 - 5 = " + calculator(10, "-", 5));
print("    10 * 5 = " + calculator(10, "*", 5));
print("    10 / 5 = " + calculator(10, "/", 5));
print("    10 % 3 = " + calculator(10, "%", 3));

print("\n=== AbstractScript Showcase Complete ===");
print("This demonstration highlights the simplicity and power of AbstractScript");
print("A perfect language for learning programming concepts!");