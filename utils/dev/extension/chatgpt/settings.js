#!/usr/bin/env node

// Opens ChatGPT extension settings.js lib in VS Code

// NOTE: Pass --chrom<e|ium> to open Chromium files only
// NOTE: Pass --<ff|firefox> to open Firefox files only
// NOTE: Pass --<project-name> to only include files from that project (partial match allowed)

// Import LIBS
const { resolve, dirname } = require('path'),
      spawn = require('cross-spawn')

const args = process.argv.slice(2)

// Init UI COLORS
const br = '\x1b[91m', // bright red
      nc = '\x1b[0m'   // no color

// Filter PROJECTS
const availProjects = require('./projects.json')
let projectsToOpen = availProjects.filter(project => args.some(arg => project.includes(arg.replace(/^-+/, ''))))
if (!projectsToOpen.length) projectsToOpen = availProjects

// Init PATHS
const repoRoot = (dir => {
    while (dir != '/' && !require('fs').existsSync(resolve(dir, 'package.json'))) dir = dirname(dir) ; return dir
})(__dirname)
const browserFilter = /--chrom/i.test(args) ? 'chromium' : /--(?:ff|firefox)/i.test(args) ? 'firefox' : null
const filePaths = projectsToOpen.flatMap(project =>
    ['chromium', 'firefox']
        .filter(browser => !browserFilter || browser == browserFilter)
        .map(browser => resolve(repoRoot, `${project}/${browser}/extension/lib/settings.js`))
).filter(path => require('fs').existsSync(path))

// OPEN files
spawn('code', ['-r', repoRoot, ...filePaths], { stdio: 'inherit' })
    .on('error', err => console.error(`${br}Failed to open VS Code: ${err.message}${nc}`))
