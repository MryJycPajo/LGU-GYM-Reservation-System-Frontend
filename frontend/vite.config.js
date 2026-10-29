import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const pagesRoot = join(projectRoot, 'src', 'pages')

function findHtmlPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return findHtmlPages(entryPath)
    }

    return extname(entry.name).toLowerCase() === '.html' ? [entryPath] : []
  })
}

const pageInputs = Object.fromEntries(
  findHtmlPages(pagesRoot).map(pagePath => {
    const relativePath = relative(projectRoot, pagePath)
      .split(sep)
      .join('/')
      .replace(/\.html$/i, '')

    return [relativePath, pagePath]
  }),
)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: join(projectRoot, 'index.html'),
        ...pageInputs,
      },
    },
  },
})
