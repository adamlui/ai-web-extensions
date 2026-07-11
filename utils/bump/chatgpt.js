#!/usr/bin/env node

// Updates local chatgpt.min.js files + @require'd chatgpt.min.js in userscripts

// NOTE: Doesn't git commit to allow script editing from breaking changes
// NOTE: Pass --cache to use cachePaths.userJSpaths for faster init

'use strict'

;(async () => {

    const args = process.argv.slice(2),
          config = { cacheMode: args.some(arg => arg.startsWith('--cache')) }

    const fs = require('fs'), // to read/write files
          path = require('path') // to manipulate paths

    const cachePaths = { root: '.cache' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}/bump.min.mjs`)
    cachePaths.userJSpaths = path.join(__dirname, `${cachePaths.root}/userscript-paths.json`)

    // Import BUMP UTILS
    fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
    fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
        'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@f63b650/utils/bump/lib/bump.min.mjs')).text()))
    const bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)

    bump.log.working('\nUpdating local chatgpt.min.js files...\n')
    const localMinFiles = await bump.findFileBySuffix({ suffix: 'chatgpt.min.js', verbose: false })
    if (localMinFiles.length) {
        const latestBuildURL = 'https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js@4/dist/chatgpt.min.js',
              latestContent = await (await fetch(latestBuildURL)).text()
        for (const filePath of localMinFiles) {
            console.log(`Updated: ${filePath}`)
            fs.writeFileSync(filePath, latestContent, 'utf-8')
        }
        bump.log.success(`Replaced chatgpt.min.js in ${localMinFiles.length} file(s).\n`)
    } else
        bump.log.info('No chatgpt.min.js files found locally.\n')

    bump.log.working(`\n${ config.cacheMode ? 'Collecting' : 'Searching for' } userscripts...\n`)
    let userJSfiles
    if (config.cacheMode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.userJSpaths), { recursive: true })
            const fd = fs.openSync(cachePaths.userJSpaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.info(`Cache file missing. Generating ${cachePaths.userJSpaths}...\n`)
            userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(userJSfiles, undefined, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.userJSpaths}`)
        } catch (err) { // use existing cache file
            userJSfiles = JSON.parse(fs.readFileSync(cachePaths.userJSpaths, 'utf-8'))
            console.log(userJSfiles) ; console.log('')
        }
    } else {
        userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('')
    }

    bump.log.working('\nFetching latest @kudoai/chatgpt.js version...\n')
    const latestVer = (await (await fetch('https://registry.npmjs.org/@kudoai/chatgpt.js/latest')).json()).version
    bump.log.info(`Latest version: ${latestVer}\n`)

    const reCJSurl = /(https:\/\/cdn\.jsdelivr\.net\/npm\/@kudoai\/chatgpt\.js@)([\d.]+)(\/dist\/chatgpt\.min\.js)(#sha256-\S+)?/g
    let urlsUpdatedCnt = 0, filesUpdatedCnt = 0
    for (const userJSfilePath of userJSfiles) {
        let content = fs.readFileSync(userJSfilePath, 'utf-8'),
            fileChanged = false
        for (const match of [...content.matchAll(reCJSurl)]) {
            const oldFullURL = match[0], oldVer = match[2], oldSRI = match[4]?.substring(1) ?? ''
            if (oldVer == latestVer) {
                console.log(`${path.basename(userJSfilePath)} already at v${latestVer}`)
                continue
            }
            bump.log.working(`\nGenerating SRI for v${latestVer}...\n`)
            const newBaseURL = `${match[1]}${latestVer}${match[3]}`,
                  newSRI = await bump.generateSRIhash({ resURL: newBaseURL, verbose: false })
            if (oldSRI == newSRI) {
                console.log(`SRI unchanged for ${path.basename(userJSfilePath)} at v${latestVer}, skipping.`)
                continue
            }
            content = content.replace(oldFullURL, `${newBaseURL}#${newSRI}`)
            fileChanged = true ; urlsUpdatedCnt++
            bump.log.success(`Updated @require in ${path.basename(userJSfilePath)}`)
        }

        if (fileChanged) {
            fs.writeFileSync(userJSfilePath, content, 'utf-8')
            bump.log.working(`Bumping userscript version...\n`)
            bump.bumpVersion({ format: 'dateVer', filePath: userJSfilePath })
            filesUpdatedCnt++
        }
    }

    bump.log[urlsUpdatedCnt ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt ? 'Success! ' : '' }${
              urlsUpdatedCnt} chatgpt.js @require(s) bumped across ${filesUpdatedCnt} file(s).`
    )
})()
