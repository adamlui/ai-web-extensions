#!/usr/bin/env node

// Bumps @version in chatbot userscripts.

// NOTE: Pass --cache to use cachePaths.chatbotPaths for faster init
// NOTE: Pass --dev to not use cachePaths.bumpUtils for latest ver
// NOTE: Pass --no-<commit|push> to skip git commit/push

(async () => {

    const chatbots = ['amazongpt', 'bravegpt', 'duckduckgpt', 'googlegpt']

    // Parse ARGS
    const args = process.argv.slice(2)
    const config = {
        cacheMode: args.some(arg => arg.startsWith('--cache')),
        devMode:  args.some(arg => arg.startsWith('--dev')),
        noCommit: args.some(arg => ['--no-commit', '-nc'].includes(arg)),
        noPush: args.some(arg => ['--no-push', '-np'].includes(arg))
    }

    // Import LIBS
    const fs = require('fs'), // to read/write files
          path = require('path'), // to manipulate paths
          { execSync, spawnSync } = require('child_process') // for git cmds

    // Init CACHE paths
    const cachePaths = { root: '.cache/' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}bump-utils.min.mjs`)
    cachePaths.chatbotPaths = path.join(__dirname, `${cachePaths.root}chatbot-paths.json`)

    // Import BUMP UTILS
    let bump
    if (config.devMode) // bypass cache for latest bump-utils.mjs
        bump = await import('./bump-utils.mjs')
    else { // import remote bump-utils.min.mjs updated every ~12h
        fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
        fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
            'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs')).text()))
        bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)
    }

    // COLLECT chatbot userscripts
    bump.log.working(`\n${ config.cacheMode ? 'Collecting' : 'Searching for' } chatbot userscripts...\n`)
    let chatbotFiles = []
    if (config.cacheMode)
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.chatbotPaths), { recursive: true })
            const fd = fs.openSync(cachePaths.chatbotPaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.error(`Cache file missing. Generating ${cachePaths.chatbotPaths}...\n`)
            for (const chatbot of chatbots) {
                chatbotFiles.push(...(await bump.findFileBySuffix({ suffix: `${chatbot}.user.js` })))
                console.log('')
            }
            fs.writeFileSync(fd, JSON.stringify(chatbotFiles, null, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.chatbotPaths}`)
        } catch (err) { // use existing cache file
            chatbotFiles = JSON.parse(fs.readFileSync(cachePaths.chatbotPaths, 'utf-8'))
            console.log(chatbotFiles) ; console.log('')
        }
    else // use bump.findFileBySuffix()
        for (const chatbot of chatbots) {
            chatbotFiles.push(...(await bump.findFileBySuffix({ suffix: `${chatbot}.user.js` })))
            console.log('')
        }

    // PROCEE each userscript
    let filesUpdatedCnt = 0
    const bumpedChatbots = {}
    for (const chatbotFile of chatbotFiles) {
        const chatbotName = path.basename(chatbotFile, '.user.js')
        bump.log.working(`\nProcessing ${chatbotName}...\n`)
        const bumpResult = bump.bumpDateVer({ filePath: chatbotFile })
        if (bumpResult) {
            const { oldVer, newVer } = bumpResult
            bump.log.success(`${chatbotName} version bumped!\n`)
            filesUpdatedCnt++
            bumpedChatbots[chatbotFile] = { oldVer, newVer }
        } else {
            console.log(`${chatbotName} already up-to-date!`)
            bump.log.endedWithLineBreak = false
        }
    }

    // LOG chatbots bumped
    const pluralSuffix = filesUpdatedCnt > 1 ? 's' : ''
    if (filesUpdatedCnt == 0) {
           bump.log.info('Completed. No chatbots bumped.') ; process.exit(0)
    } else bump.log.success(`${filesUpdatedCnt} chatbot${pluralSuffix} bumped!`)

    // ADD/COMMIT/PUSH bump(s)
    if (!config.noCommit) {
        bump.log.working(`\nCommitting bump${pluralSuffix} to Git...\n`)

        // Init commit msg
        let commitMsg = 'Bumped `@version`' ; const uniqueVers = {}
        Object.values(bumpedChatbots).forEach(({ newVer }) => { uniqueVers[newVer] = true })
        if (Object.keys(uniqueVers).length == 1)
            commitMsg += ` to \`${Object.keys(uniqueVers)[0]}\``

        // git add/commit/push
        try {
            execSync('git add ./*.user.js')
            spawnSync('git', ['commit', '-n', '-m', commitMsg], { stdio: 'inherit', encoding: 'utf-8' })
            console.log('') // line break
            if (!config.noPush) {
                bump.log.working('\nPulling latest changes from remote to sync local repository...\n')
                execSync('git pull')
                bump.log.working(`\nPushing bump${pluralSuffix} to Git...\n`)
                execSync('git push')
            }
            bump.log.success(`Success! ${filesUpdatedCnt} chatbot${pluralSuffix} updated${
                !config.noCommit ? '/committed' : '' }${ !config.noPush ? '/pushed' : '' } to GitHub`)
        } catch (err) { bump.log.error('Git operation failed: ' + err.message) }
    }

    // Final SUMMARY log
    console.log('') // line break
    Object.entries(bumpedChatbots).forEach(([chatbotFile, { oldVer, newVer }]) => {
        const chatbotName = path.basename(chatbotFile, '.user.js')
        console.log(`  ± ${chatbotName}.user.js ${
            bump.colors.bw}v${oldVer}${bump.colors.nc} → ${bump.colors.bg}v${newVer}${bump.colors.nc}`)
    })

})()
