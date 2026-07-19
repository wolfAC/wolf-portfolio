// Phase B4 primitive asset generator: static/floor/slabs.png
//
// Replaces the stone-slab pavement pattern (originally authored in
// resources/textures/slabs.sbs, a Substance Designer graph unavailable in this
// environment) with a procedural, seamlessly tileable diamond-plate / paver
// pattern -- a real usable texture, not a placeholder. Only the R channel is
// read by the engine (sources/Game/World/Floor.js: `texture(floorSlabsTexture,
// ...).r`), so R/G/B are written identically (grayscale) so the file also reads
// correctly if opened directly.

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const SIZE = 256
const TILES = 8 // 8x8 pavers across the texture; tiles evenly so it wraps seamlessly
const GROUT_WIDTH = 0.06 // fraction of one tile's width
const BEVEL_STRENGTH = 0.30
const GROUT_STRENGTH = 0.35
const BASE_VALUE = 0.55

function clamp01(value)
{
    return Math.max(0, Math.min(1, value))
}

function smoothstep(edge0, edge1, x)
{
    const t = clamp01((x - edge0) / (edge1 - edge0))
    return t * t * (3 - 2 * t)
}

const pixels = Buffer.alloc(SIZE * SIZE * 4)

for(let py = 0; py < SIZE; py++)
{
    const v = py / SIZE

    for(let px = 0; px < SIZE; px++)
    {
        const u = px / SIZE

        // Position within the current tile, in [0, 1) on both axes -- periodic by
        // construction (TILES is an integer), so the pattern tiles seamlessly.
        const tu = (u * TILES) % 1
        const tv = (v * TILES) % 1

        // Grout lines: dark seams at every tile boundary.
        const edgeDistU = Math.min(tu, 1 - tu)
        const edgeDistV = Math.min(tv, 1 - tv)
        const edgeDist = Math.min(edgeDistU, edgeDistV)
        const grout = 1 - smoothstep(0, GROUT_WIDTH, edgeDist)

        // Diamond bevel highlight: brightest at tile center, falling off to the edges.
        const centerU = tu - 0.5
        const centerV = tv - 0.5
        const diamond = Math.max(0, 1 - (Math.abs(centerU) + Math.abs(centerV)) * 2)

        let value = BASE_VALUE + BEVEL_STRENGTH * diamond - GROUT_STRENGTH * grout
        value = clamp01(value)

        const gray = Math.round(value * 255)
        const offset = (py * SIZE + px) * 4
        pixels[offset + 0] = gray
        pixels[offset + 1] = gray
        pixels[offset + 2] = gray
        pixels[offset + 3] = 255
    }
}

const outputPath = path.join(here, '..', '..', '..', 'static', 'floor', 'slabs.png')

const image = sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
await image.png().toFile(outputPath)

console.log(`Wrote ${outputPath} (${SIZE}x${SIZE} grayscale diamond-plate pavement pattern, ${TILES}x${TILES} tiles)`)
