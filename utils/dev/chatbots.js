#!/usr/bin/env node

// Opens KudoAI chatbots in VS Code

const projects = ['amazongpt', 'bravegpt', 'duckduckgpt', 'googlegpt']

// Import LIBS
const { resolve, dirname } = require('path'),
      spawn = require('cross-spawn')

// Init UI COLORS
const br = '\x1b[91m', // bright red
      nc = '\x1b[0m'   // no color

// Init PATHS
const repoRoot = (dir => {
    while (dir != '/' && !require('fs').existsSync(resolve(dir, 'package.json'))) dir = dirname(dir) ; return dir
})(__dirname)
const filePaths = projects.map(
    project => resolve(repoRoot, `${project}/greasemonkey/${project}.user.js`)
).filter(path => require('fs').existsSync(path))

// OPEN files
spawn('code', ['-r', repoRoot, ...filePaths], { stdio: 'inherit' })
    .on('error', err => console.error(`${br}Failed to open VS Code: ${err.message}${nc}`))
