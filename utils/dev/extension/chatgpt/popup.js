#!/usr/bin/env node

// Opens ChatGPT extension popup files in VS Code

// NOTE: Opens controller.js by default
// NOTE: Pass --<html|index> to open index.html
// NOTE: Pass --<css|styles> to open style.css
// NOTE: Pass --all to open all popup files
// NOTE: Pass --<project-name> to only include files from that project (partial match allowed)

// Import LIBS
const { resolve, dirname } = require('path'),
      spawn = require('cross-spawn')

const args = process.argv.slice(2)

// Init UI COLORS
const br = '\x1b[91m', // bright red
      nc = '\x1b[0m'   // no color

// Init FILES to open
const availFiles = ['controller.js', 'index.html', 'style.css']
const filesToOpen = /--all/i.test(args) ? availFiles
    : [availFiles[ /--(?:css|style)/i.test(args) ? 2 : /--(?:html|index)/i.test(args) ? 1 : 0 ]]

// Filter PROJECTS
const availProjects = require('./projects.json')
let projectsToOpen = availProjects.filter(project => args.some(arg => project.includes(arg.replace(/^-+/, ''))))
if (!projectsToOpen.length) projectsToOpen = availProjects

// Init PATHS
const repoRoot = (dir => {
    while (dir != '/' && !require('fs').existsSync(resolve(dir, 'package.json'))) dir = dirname(dir) ; return dir
})(__dirname)
const filePaths = projectsToOpen.flatMap(project =>
    ['chromium', 'firefox'].flatMap(browser =>
        filesToOpen.map(fileType => resolve(repoRoot, `${project}/${browser}/extension/popup/${fileType}`)))
).filter(path => require('fs').existsSync(path))

// OPEN files
spawn('code', ['-r', repoRoot, ...filePaths], { stdio: 'inherit' })
    .on('error', err => console.error(`${br}Failed to open VS Code: ${err.message}${nc}`))
