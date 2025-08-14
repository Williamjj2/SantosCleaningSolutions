const fs = require('fs')
const path = require('path')

function scan(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) scan(full)
    else if (/\.(html|tsx|ts|jsx|js)$/.test(entry)) {
      const txt = fs.readFileSync(full, 'utf8')
      const strongs = (txt.match(/<strong>/g) || []).length + (txt.match(/<b>/g) || []).length
      if (strongs > 12) {
        console.log(`WARN strong tags over limit: ${full} (${strongs})`)
      }
    }
  }
}

scan(path.join(__dirname, '..'))


