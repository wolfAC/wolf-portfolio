// Phase G5 asset generator: static/palette.png (+ resources/palette.png, kept
// in sync since both were byte-identical before this change).
//
// This is a 128x4 "indexed swatch" lookup texture: 32 columns of 4px each,
// where existing glTF-authored meshes' vertex UVs sample the CENTER of a
// specific column to get one flat baked color (a common technique to avoid
// needing individual textures per small prop). Columns 24-31 were already
// solid black (unused/reserved) in the original and are left that way.
//
// Unlike Phase B's terrain/slab textures (fully regenerated because both the
// texture and its only consumers were rebuilt together), this palette is still
// read by static/scenery/scenery.glb and static/areas/areas.glb -- original,
// unreplaced Bruno Simon content (Phase D/L will eventually redo them). Those
// meshes' UVs are baked to sample SPECIFIC COLUMN POSITIONS, so the fix here
// preserves the exact 128x4 grid and column boundaries, only replacing each
// column's *color* -- any old mesh sampling any column gets a coherent Cyber
// City tone instead of the original nature/rustic one, without needing to know
// which specific mesh reads which specific column.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const WIDTH = 128
const HEIGHT = 4
const COLUMN_WIDTH = 4

// One replacement color per original column (0-23), preserving column order/
// count exactly; columns 24-31 stay black as in the original.
const COLUMNS = [
    '#3a3550', '#d9c9a8', '#23212f', '#28e0ff',
    '#8a8698', '#1c1b22', '#23212f', '#e8b8a8',
    '#ffb020', '#3d5a5e', '#d98a6b', '#6b5d52',
    '#a89a3a', '#7d7468', '#a85f3f', '#ff6a1a',
    '#ff2e4d', '#f5e0dc', '#ffb26b', '#b3106b',
    '#b366ff', '#ff2e8a', '#12101a', '#fff5f0',
]

function hexToRgb(hex)
{
    const value = parseInt(hex.slice(1), 16)
    return [ (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff ]
}

const pixels = Buffer.alloc(WIDTH * HEIGHT * 3)

for(let column = 0; column < WIDTH / COLUMN_WIDTH; column++)
{
    const rgb = column < COLUMNS.length ? hexToRgb(COLUMNS[column]) : [ 0, 0, 0 ]

    for(let row = 0; row < HEIGHT; row++)
    {
        for(let dx = 0; dx < COLUMN_WIDTH; dx++)
        {
            const x = column * COLUMN_WIDTH + dx
            const offset = (row * WIDTH + x) * 3
            pixels[offset + 0] = rgb[0]
            pixels[offset + 1] = rgb[1]
            pixels[offset + 2] = rgb[2]
        }
    }
}

const image = sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })

const outputPaths = [
    path.join(here, '..', '..', '..', 'static', 'palette.png'),
    path.join(here, '..', '..', '..', 'resources', 'palette.png'),
]

for(const outputPath of outputPaths)
{
    await image.clone().png().toFile(outputPath)
    console.log(`Wrote ${outputPath}`)
}
