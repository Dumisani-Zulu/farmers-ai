#!/usr/bin/env node

/**
 * Script to prevent Expo from automatically modifying tsconfig.json
 * Run this after Expo tries to modify the config
 */

const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');

const correctConfig = {
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "incremental": true,
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    ".expo",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
};

function fixTsConfig() {
  try {
    console.log('🔧 Fixing tsconfig.json...');
    fs.writeFileSync(tsconfigPath, JSON.stringify(correctConfig, null, 2));
    console.log('✅ tsconfig.json has been restored to correct configuration');
  } catch (error) {
    console.error('❌ Error fixing tsconfig.json:', error.message);
  }
}

if (require.main === module) {
  fixTsConfig();
}

module.exports = { fixTsConfig };
