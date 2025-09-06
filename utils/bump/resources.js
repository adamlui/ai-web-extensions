#!/usr/bin/env node

// Bumps @require'd JS in userscripts

// * NOTE: Doesn't git commit to allow script editing from breaking changes
// * NOTE: Pass --cache to use cache.paths.userJSpaths for faster init

(async () => {

    // Import LIBS
    const fs = require('fs'), // to read/write files
          path = require('path') // to manipulate paths

    // Init CACHE vars
    const cache = { mode: process.argv.includes('--cache'), paths: { root: '.cache/' }}
    cache.paths.bumpUtils = path.join(__dirname, `${cache.paths.root}bump-utils.min.mjs`)
    cache.paths.userJSpaths = path.join(__dirname, `${cache.paths.root}userscript-paths.json`)

    // Import BUMP UTILS
    fs.mkdirSync(path.dirname(cache.paths.bumpUtils), { recursive: true })
    fs.writeFileSync(cache.paths.bumpUtils, (await (await fetch(
        'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs')).text()
    ).replace(/^\/\*\*[\s\S]*?\*\/\s*/, '')) // strip JSD header minification comment
    const bump = await import(`file://${cache.paths.bumpUtils}`) ; fs.unlinkSync(cache.paths.bumpUtils)

    // Init REGEX
    const regEx = {
        hash: { commit: /(@|\?v=)([^/#]+)/, sri: /[^#]+$/ },
        resName: /[^/]+\/(?:dist)?\/?[^/]+\.js(?=[?#]|$)/,
        jsURL: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/
    }

    // Collect userscripts
    bump.log.working(`\n${ cache.mode ? 'Collecting' : 'Searching for' } userscripts...\n`)
    let userJSfiles = []
    if (cache.mode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cache.paths.userJSpaths), { recursive: true })
            const fd = fs.openSync(cache.paths.userJSpaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.error(`Cache file missing. Generating ${cache.paths.userJSpaths}...\n`)
            userJSfiles = await bump.findUserJS() ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(userJSfiles, null, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cache.paths.userJSpaths}`)
        } catch (err) { // use existing cache file
            userJSfiles = JSON.parse(fs.readFileSync(cache.paths.userJSpaths, 'utf-8'))
            console.log(userJSfiles) ; console.log('')
        }
    } else { // use bump.findUserJS()
        userJSfiles = await bump.findUserJS() ; console.log('') }

    // Collect resources
    bump.log.working('\nCollecting resources...\n')
    const urlMap = {} ; let resCnt = 0
    userJSfiles.forEach(userJSfilePath => {
        const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
              resURLs = [...userJScontent.matchAll(new RegExp(regEx.jsURL.source, 'gm'))].map(match => match[1])
        if (resURLs?.length) { urlMap[userJSfilePath] = resURLs ; resCnt += resURLs.length }
    })
    bump.log.success(`${resCnt} potentially bumpable resource(s) found.`)

    // Fetch latest commit hash for adamlui/ai-web-extensions
    bump.log.working('\nFetching latest commit hash for adamlui/ai-web-extensions...\n')
    const latestCommitHashes = { aiweb: await bump.getLatestCommitHash('adamlui/ai-web-extensions') }

    // Process each userscript
    let urlsUpdatedCnt = 0 ; let filesUpdatedCnt = 0
    for (const userJSfilePath of Object.keys(urlMap)) {

        // Init repo name
        let repoName = userJSfilePath.split('\\').pop().replace('.user.js', '')
        if (repoName.endsWith('-mode')) repoName = repoName.slice(0, -5) // for chatgpt-widescreen

        bump.log.working(`\nProcessing ${repoName}...\n`)

        // Fetch latest commit hash for repo/chromium/extension
        if (urlMap[userJSfilePath].some(url => url.includes(repoName))) {
            console.log('Fetching latest commit hash for Chromium extension...')
            latestCommitHashes.chromium = await bump.getLatestCommitHash(`adamlui/${repoName}`, 'chromium/extension')
        }

        // Process each resource
        let fileUpdated = false
        for (const resURL of urlMap[userJSfilePath]) {
            if (!await bump.isValidResource(resURL)) continue // to next resource
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
            if (!await bump.isValidResource(updatedURL)) continue // to next resource

            // Generate/compare/update SRI hash
            console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Generating SRI (SHA-256) hash for ${resName}...`)
            const newSRIhash = await bump.generateSRIhash(updatedURL)
            if (regEx.hash.sri.exec(resURL)?.[0] == newSRIhash) { // SRI hash didn't change
                console.log(`${resName} already up-to-date!`) ; bump.log.endedWithLineBreak = false
                continue // ...so skip resource
            }
            updatedURL = updatedURL.replace(regEx.hash.sri, newSRIhash) // update hash
            if (!await bump.isValidResource(updatedURL)) continue // to next resource

            // Write updated URL to userscript
            console.log(`Writing updated URL for ${resName}...`)
            const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8')
            fs.writeFileSync(userJSfilePath, userJScontent.replace(resURL, updatedURL), 'utf-8')
            bump.log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++ ; fileUpdated = true
        }
        if (fileUpdated) {
            console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
            bump.bumpUserJSver(userJSfilePath) ; filesUpdatedCnt++
        }
    }

    // Log final summary
    bump.log[urlsUpdatedCnt ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt ? 'Success! ' : '' }${
              urlsUpdatedCnt} resource(s) bumped across ${filesUpdatedCnt} file(s).`
    )

})()
