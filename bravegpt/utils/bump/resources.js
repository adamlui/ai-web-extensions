#!/usr/bin/env node

// Bumps @require'd JS in userscript
// NOTE: Doesn't git commit to allow script editing from breaking changes

(async () => {

    // Import LIBS
    const fs = require('fs'), // to read/write files
          path = require('path') // to manipulate paths

    // Init CACHE vars
    const cache = { mode: process.argv.includes('--cache'), paths: { root: '.cache/' }}
    cache.paths.bumpUtils = path.join(__dirname, `${cache.paths.root}bump-utils.min.mjs`)

    // Import BUMP UTILS
    fs.mkdirSync(path.dirname(cache.paths.bumpUtils), { recursive: true })
    fs.writeFileSync(cache.paths.bumpUtils, (await (await fetch(
        'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs')).text()
    ).replace(/^\/\*\*[\s\S]*?\*\/\s*/, '')) // strip JSD header minification comment
    const bump = await import(`file://${cache.paths.bumpUtils}`) ; fs.unlinkSync(cache.paths.bumpUtils)

    // Init REPO context
    const repoName = (() => {
        const path = require('path') ; let dir = __dirname
        while (!fs.existsSync(path.join(dir, 'package.json'))) dir = path.dirname(dir)
        return path.basename(dir)
    })()
    const userJSfilePath = `./greasemonkey/${repoName}.user.js`

    // Init REGEX
    const regEx = {
        hash: { commit: /(@|\?v=)([^/#]+)/, sri: /[^#]+$/ },
        resName: /[^/]+\/(?:dist)?\/?[^/]+\.js(?=[?#]|$)/,
        jsURL: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/
    }

    // Run MAIN routine

    // Collect resourcs
    bump.log.working('\nCollecting resources...\n')
    const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
          resURLs = [...userJScontent.matchAll(new RegExp(regEx.jsURL.source, 'gm'))].map(match => match[1])
    bump.log.success(`${resURLs.length} potentially bumpable resource(s) found.`)

    // Fetch latest commit hash for adamlui/ai-web-extensions
    bump.log.working('\nFetching latest commit hash for adamlui/ai-web-extensions...\n')
    const latestCommitHashes = { aiweb: await bump.getLatestCommitHash({ repo: 'adamlui/ai-web-extensions' }) }

    bump.log.working('\nProcessing resource(s)...\n')
    let urlsUpdatedCnt = 0

    // Fetch latest commit hash for repo/chrom<e|ium>/extension
    if (resURLs.some(url => url.includes(repoName))) {
        console.log('Fetching latest commit hash for Chromium extension...')
        latestCommitHashes.chromium = await bump.getLatestCommitHash(
            { repo: `adamlui/${repoName}`, path: 'chromium/extension' })
    }

    // Process each resource
    for (const resURL of resURLs) {
        if (!await bump.isValidResource({ resURL })) continue // to next resource
        const resName = regEx.resName.exec(resURL)?.[0] || 'resource' // dir/filename for logs

        // Compare/update commit hash
        let resLatestCommitHash = latestCommitHashes[resURL.includes(repoName) ? 'chromium' : 'aiweb']
        if (resLatestCommitHash.startsWith( // compare hashes
            regEx.hash.commit.exec(resURL)?.[2] || '')) { // commit hash didn't change...
                console.log(`${resName} already up-to-date!`) ; bump.log.endedWithLineBreak = false
                continue // ...so skip resource
            }
        resLatestCommitHash = resLatestCommitHash.substring(0, 7) // abbr it
        let updatedURL = resURL.replace(regEx.hash.commit, `$1${resLatestCommitHash}`) // update hash
        if (!await bump.isValidResource({ resURL: updatedURL })) continue // to next resource

        // Generate/compare/update SRI hash
        console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Generating SRI (SHA-256) hash for ${resName}...`)
        const newSRIhash = await bump.generateSRIhash({ resURL: updatedURL })
        if (regEx.hash.sri.exec(resURL)?.[0] == newSRIhash) { // SRI hash didn't change
            console.log(`${resName} already up-to-date!`) ; bump.log.endedWithLineBreak = false
            continue // ...so skip resource
        }
        updatedURL = updatedURL.replace(regEx.hash.sri, newSRIhash) // update hash
        if (!await bump.isValidResource({ resURL: updatedURL })) continue // to next resource

        // Write updated URL to userscript
        console.log(`Writing updated URL for ${resName}...`)
        const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8')
        fs.writeFileSync(userJSfilePath, userJScontent.replace(resURL, updatedURL), 'utf-8')
        bump.log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++
    }
    if (urlsUpdatedCnt) {
        console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
        bump.bumpUserJSver(userJSfilePath)
    }

    // Log final summary
    bump.log[urlsUpdatedCnt ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt ? 'Success! ' : '' }${urlsUpdatedCnt} resource(s) bumped.`)

})()
