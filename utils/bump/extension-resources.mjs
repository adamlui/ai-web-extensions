#!/usr/bin/env node

// Overwrites local <chatgpt|css|dom>.min.js w/ latest builds

'use strict'

import fs from 'fs'
import path from 'path'

const script = {
    cache: { paths: { root: '.cache' }},
    targetResources: {
        'chatgpt.min.js': 'https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js@4/dist/chatgpt.min.js',
        'css.min.js': 'https://cdn.jsdelivr.net/gh/adamlui/userscripts@master/assets/js/lib/css.js/dist/css.min.js',
        'dom.min.js': 'https://cdn.jsdelivr.net/gh/adamlui/userscripts@master/assets/js/lib/dom.js/dist/dom.min.js'
    },
    urls: { bumpmjs: 'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions/utils/bump/lib/bump.min.mjs' }
}
script.cache.paths.bumpmjs = path.join(process.cwd(), `${script.cache.paths.root}/bump.min.mjs`)
const { cache: { paths: cachePaths }} = script

// Import bump.mjs
fs.mkdirSync(path.dirname(cachePaths.bumpmjs), { recursive: true })
fs.writeFileSync(cachePaths.bumpmjs, (await (await fetch(script.urls.bumpmjs)).text()))
const bump = await import(`file://${cachePaths.bumpmjs}`)
fs.unlinkSync(cachePaths.bumpmjs)

for (const [filename, url] of Object.entries(script.targetResources)) {
    bump.log.working(`\nUpdating local ${filename} files...\n`)
    try {
        const localFiles = await bump.findFileBySuffix({ suffix: filename, verbose: false })
        if (localFiles.length) {
            const latestContent = await (await fetch(url)).text()
            for (const filePath of localFiles) {
                fs.writeFileSync(filePath, latestContent, 'utf-8')
                console.log(`Updated: ${filePath}`)
            }
            bump.log.success(`Replaced ${filename} in ${localFiles.length} file(s).\n`)
        } else
            bump.log.info(`No ${filename} files found locally.\n`)
    } catch (err) {
        bump.log.error(`Error updating ${filename}: ${err.message}`)
    }
}

bump.log.success('\nLocal extension resources updated.\n')
