const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
  reporter: 'list',
});
