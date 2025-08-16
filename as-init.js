#!/usr/bin/env node
import fs from "fs";

const defaultConfig = {
  rootDir: "src",
  outDir: "dist",
  include: ["**/*.as"],
  strict: true
};

const configPath = "asconfig.json";

if (fs.existsSync(configPath)) {
  console.log("⚠️  asconfig.json уже существует!");
} else {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf8");
  console.log("✅ asconfig.json создан!");
  console.log("Теперь можно положить исходники в src/ и запускать transpiler.js");
}
