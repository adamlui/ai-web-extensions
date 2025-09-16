// bump-utils.mjs for finding/bumping/hashing etc.
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/utils/bump/bump-utils.mjs
// Latest minified build: https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs

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

export function bumpVersion({ format = 'dateVer', type, filePath, verbose = true } = {}) {
    if (!filePath) throw new Error(`'filePath' option required by bumpVersion()`)
    if (format == 'semVer' && !type) throw new Error(`'type' option required by bumpVersion({ format: 'semVer' })`)
    const fileContent = fs.readFileSync(filePath, 'utf-8'),
          oldVer = fileContent.match(/(?:@version|"version"):?\s*"?([\d.]+)"?/)?.[1]
    if (!oldVer) return this.log.info(`No version found in ${filePath}`)
    let newVer
    if (format == 'dateVer') {
        const date = new Date(), today = `${date.getFullYear()}.${ date.getMonth() +1 }.${date.getDate()}`
        newVer = oldVer == today ? `${today}.1`
               : oldVer.startsWith(`${today}.`) ? `${today}.${ parseInt(oldVer.split('.').pop()) +1 }`
               : today
    } else if (format == 'semVer') {
        const [major, minor, patch] = oldVer.split('.').map(Number)
        newVer = type == 'major' ? `${ major +1 }.0.0`
               : type == 'minor' ? `${major}.${ minor +1 }.0`
               : type == 'patch' ? `${major}.${minor}.${ patch +1 }` : ''
    }
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
    if (!dir && !global.monorepoRoot) { // init missing dir
        dir = path.dirname(fileURLToPath(import.meta.url))
        while (!fs.existsSync(path.join(dir, 'package.json'))) dir = path.dirname(dir)
        global.monorepoRoot = dir
    }

    const foundFiles = []
    ;(function search(currentDir) {
        for (const entry of fs.readdirSync(currentDir)) {
            const entryPath = path.join(currentDir, entry), stat = fs.statSync(entryPath)
            if (stat.isDirectory()) {
                if (entry == 'node_modules' || (entry.startsWith('.') && !dotFolders)) continue
                if (recursive) search(entryPath)
            } else if (stat.isFile()) {
                if (ignoreFiles.includes(entry) || (entry.startsWith('.') && !dotFiles)) continue
                if (entry.endsWith(suffix)) { foundFiles.push(entryPath) ; if (verbose) console.log(entryPath) }
            }
        }
    })(path.resolve(dir))
    return foundFiles
}

export async function generateSRIhash({ resURL, algorithm = 'sha256', verbose = true } = {}) {
    if (!resURL) throw new Error(`'resURL' option required by generateSRIhash()`)
    try {
        const sriHash = ssri.fromData(
            Buffer.from(await (await fetch(resURL)).arrayBuffer()), { algorithms: [algorithm] }).toString()
        if (verbose) this.log.hash(`${sriHash}\n`)
        return sriHash
    } catch (err) { throw new Error(`Cannot generate SRI hash for: ${resURL}`) }
}

export async function getLatestCommitHash({ repo, path = '', source = 'github', verbose = true } = {}) {
    if (!repo) throw new Error(`'repo' option required by getLatestCommitHash()`)
    const endpoints = {
        github: `https://api.github.com/repos/${repo}/commits`,
        gitlab: `https://gitlab.com/api/v4/projects/${encodeURIComponent(repo)}/repository/commits`
    }
    let latestCommitHash
    for (const src of [source, source == 'github' ? 'gitlab' : 'github']) {
        try {
            const data = await (await fetch(`${endpoints[src]}?path=${path}&per_page=1`)).json()
            latestCommitHash = data[0]?.sha || data[0]?.id
            if (latestCommitHash) break
        } catch (err) { continue } // to next source
    }
    if (verbose && latestCommitHash) { this.log.hash(`${latestCommitHash}\n`) ; return latestCommitHash }
    else if (!latestCommitHash)
        throw new Error(`Cannot fetch latest commit hash for: ${repo}${ path ? '/' + path : '' }`)
}

export async function isValidResource({ resURL, verbose = true } = {}) {
    if (!resURL) throw new Error(`'resURL' option required by isValidResource()`)
    try {
        const resIsValid = !(await (await fetch(resURL)).text()).startsWith('Package size exceeded')
        if (verbose) this.log[resIsValid ? 'info' : 'error'](
            `\n${ resIsValid ? 'V' : 'Inv' }alid resource: ${resURL}\n`)
        return resIsValid
    } catch (err) { throw new Error(`Cannot validate resource: ${resURL}`) }
}
