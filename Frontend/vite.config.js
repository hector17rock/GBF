import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'

function extFromMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/svg+xml') return 'svg'
  return ''
}

function safeFilename(input) {
  const s = String(input || '').trim()
  if (!s) return ''
  // Replace spaces and any risky characters; prevent path traversal.
  const cleaned = s.replace(/[^a-zA-Z0-9._-]/g, '_')
  return path.basename(cleaned)
}

// Dev-only endpoint to write images into public/images from the Admin UI.
// Client POSTs JSON: { filename, dataUrl }
function gbfImageUploadPlugin() {
  return {
    name: 'gbf-image-upload',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/__gbf_upload_image')) return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
          return
        }

        let raw = ''
        req.on('data', (chunk) => {
          raw += chunk
          // ~10MB limit (JSON + base64)
          if (raw.length > 10_000_000) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: 'Payload too large' }))
            req.destroy()
          }
        })

        req.on('end', () => {
          ;(async () => {
            let payload
            try {
              payload = JSON.parse(raw || '{}')
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }))
              return
            }

            const filenameHint = safeFilename(payload?.filename)
            const dataUrl = String(payload?.dataUrl || '')
            const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
            if (!m) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: 'Invalid dataUrl' }))
              return
            }

            const mime = m[1]
            const b64 = m[2]
            const ext = extFromMime(mime)

            let name = filenameHint || (ext ? `upload.${ext}` : 'upload')
            if (!path.extname(name) && ext) name = `${name}.${ext}`

            const rootDir = server.config.root || process.cwd()
            const outDir = path.resolve(rootDir, 'public', 'images')
            const outPath = path.join(outDir, name)

            await fs.mkdir(outDir, { recursive: true })
            const buf = Buffer.from(b64, 'base64')
            await fs.writeFile(outPath, buf)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, url: `/images/${name}` }))
          })().catch((err) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: err?.message || 'Server error' }))
          })
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), gbfImageUploadPlugin()],
})
