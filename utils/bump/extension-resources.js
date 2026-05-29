#!/usr/bin/env node

// Replaces local chatgpt.min.js, css.min.js, dom.min.js with latest builds

(async () => {
    'use strict'

    const fs = require('fs'),
          path = require('path')

    // Import BUMP UTILS (still needed for findFileBySuffix)
    const cachePaths = { root: '.cache' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}/bump.min.mjs`)

    fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
    fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
        'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@f63b650/utils/bump/lib/bump.min.mjs')).text()))
    const bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)

    // Define the resources to update
    const resources = [
        {
            suffix: 'chatgpt.min.js',
            fetchURL: 'https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js@4/dist/chatgpt.min.js',
            label: 'chatgpt.min.js'
        },
        {
            suffix: 'css.min.js',
            fetchURL: 'https://cdn.jsdelivr.net/gh/adamlui/userscripts@master/assets/js/lib/css.js/dist/css.min.js',
            label: 'css.min.js'
        },
        {
            suffix: 'dom.min.js',
            fetchURL: 'https://cdn.jsdelivr.net/gh/adamlui/userscripts@master/assets/js/lib/dom.js/dist/dom.min.js',
            label: 'dom.min.js'
        }
    ]

    // Process each resource
    for (const res of resources) {
        bump.log.working(`\nUpdating local ${res.label} files...\n`)
        const localFiles = await bump.findFileBySuffix({ suffix: res.suffix, verbose: false })
        if (localFiles.length) {
            const latestContent = await (await fetch(res.fetchURL)).text()
            for (const filePath of localFiles) {
                fs.writeFileSync(filePath, latestContent, 'utf-8')
                console.log(`Updated: ${filePath}`)
            }
            bump.log.success(`Replaced ${res.label} in ${localFiles.length} file(s).\n`)
        } else {
            bump.log.info(`No ${res.label} files found locally.\n`)
        }
    }

    bump.log.success('\nLocal extension resources updated.\n')
})()
