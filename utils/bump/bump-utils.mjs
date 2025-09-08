#!/usr/bin/env node

// bump-utils.mjs for finding/bumping/hashing etc.
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/utils/bump/bump-utils.mjs
// Latest miniified release: https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs

import fs from 'fs' // to read/write files
import ssri from 'ssri' // to generate SHA-256 hashes
import path from 'path' // to manipulate paths
import { fileURLToPath } from 'url' // to init monorepo root

const colors = {
    nc: '\x1b[0m',        // no color
    dg: '\x1b[38;5;243m', // dim gray
    bw: '\x1b[1;97m',     // bright white
    by: '\x1b[1;33m',     // bright yellow
    bg: '\x1b[1;92m',     // bright green
    br: '\x1b[1;91m'      // bright red
}
const { nc, dg, bw, by, bg, br } = colors
const lvlColors = { hash: dg, info: bw, working: by, success: bg, error: br }
const log = {} ; Object.keys(lvlColors).forEach(lvl => log[lvl] = function(msg) {
    const formattedMsg = lvlColors[lvl] +( log.endedWithLineBreak ? msg.trimStart() : msg ) + nc
    console.log(formattedMsg) ; log.endedWithLineBreak = msg.toString().endsWith('\n')
})

export { colors, log }

export function bumpDateVer({ filePath, verbose = true } = {}) { // bumps YYYY.M.D versions
    if (!filePath) throw new Error(`'filePath' option required by bumpDateVer()`)
    const fileContent = fs.readFileSync(filePath, 'utf-8'),
          oldVer = fileContent.match(/(?:@version|"version"):?\s*"?([\d.]+)"?/)?.[1]
    if (!oldVer) return this.log.info(`No version found in ${filePath}`)
    const date = new Date(), today = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
    const newVer = oldVer == today ? `${today}.1` // bump sub-ver to 1
                 : oldVer.startsWith(`${today}.`) ? `${ // bump sub-ver to 2+
                       today}.${ parseInt(oldVer.split('.').pop()) +1 }`
                 : today // bump to today
    fs.writeFileSync(filePath, fileContent.replace(new RegExp(`("?)${oldVer}("?)`), `$1${newVer}$2`), 'utf-8')
    if (verbose) this.log.success(`${nc}Updated: ${bw}v${oldVer}${nc} → ${bg}v${newVer}${nc}\n`)
    return { oldVer, newVer }
}

export function findFileBySuffix({
    suffix, // string filename ending to search for (e.g., '.user.js', 'manifest.json')
    dir = global.monorepoRoot, // string dir to start search from
    verbose = true, // boolean to log found files to console
    recursive = true, // boolean to search subdirs recursively
    dotFolders = false, // boolean to include hidden folders
    dotFiles = false, // boolean to include hidden files
    ignoreFiles = [] // array of filenames to exclude from results
} = {}) {

    if (!suffix) throw new Error(`'suffix' option required by findFileBySuffix()`)
    if (!dir && !global.monorepoRoot) {
        dir = path.dirname(fileURLToPath(import.meta.url))
        while (!fs.existsSync(path.join(dir, 'package.json'))) dir = path.dirname(dir)
        global.monorepoRoot = dir
    }

    const foundFiles = []
    ;(function search(currentDir) {
        for (const entry of fs.readdirSync(currentDir)) {
            if (entry.startsWith('.') && !dotFolders && fs.statSync(path.join(currentDir, entry)).isDirectory())
                continue // skip dotfolders if disabled
            if (entry == 'node_modules') continue
            const entryPath = path.join(currentDir, entry), stat = fs.statSync(entryPath)
            if (stat.isDirectory() && recursive) search(entryPath)
            else if (stat.isFile() && entry.endsWith(suffix)
                && (dotFiles || !entry.startsWith('.'))
                && !ignoreFiles.includes(entry)
            ) { foundFiles.push(entryPath) ; if (verbose) console.log(entryPath) }
        }
    })(path.resolve(dir))
    return foundFiles
}

export async function generateSRIhash({ resURL, algorithm = 'sha256', verbose = true } = {}) {
    if (!resURL) throw new Error(`'resURL' option required by generateSRIhash()`)
    const sriHash = ssri.fromData(
        Buffer.from(await (await fetch(resURL)).arrayBuffer()), { algorithms: [algorithm] }).toString()
    if (verbose) this.log.hash(`${sriHash}\n`)
    return sriHash
}

export async function getLatestCommitHash({ repo, path = '', verbose = true } = {}) {
    if (!repo) throw new Error(`'repo' option required by getLatestCommitHash()`)
    const endpoint = `https://api.github.com/repos/${repo}/commits`,
          latestCommitHash = (await (await fetch(`${endpoint}?path=${path}`)).json())[0]?.sha
    if (verbose && latestCommitHash) this.log.hash(`${latestCommitHash}\n`)
    return latestCommitHash
}

export async function isValidResource({ resURL, verbose = true } = {}) {
    if (!resURL) throw new Error(`'resURL' option required by isValidResource()`)
    try {
        const resIsValid = !(await (await fetch(resURL)).text()).startsWith('Package size exceeded')
        if (verbose) this.log[resIsValid ? 'info' : 'error'](
            `\n${ resIsValid ? 'V' : 'Inv' }alid resource: ${resURL}\n`)
        return resIsValid
    } catch (err) { return this.log.error(`\nCannot validate resource: ${resURL}\n`) }
}
