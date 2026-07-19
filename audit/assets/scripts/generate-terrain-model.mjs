// Phase B1 primitive asset generator: static/terrain/terrain.glb
//
// There is no 3D authoring tool (Blender) available in this environment, so this
// script produces a real, valid, loadable glTF binary directly -- a "temporary
// primitive version" per the migration rules, not a placeholder. It is consumed
// by sources/Game/World/Floor.js purely as a height source for the Rapier
// heightfield collider (Floor.js never renders this geometry -- see
// audit/repo-analysis.md), so a hand-written minimal mesh (POSITION + indices,
// no material/UVs/normals) is a complete, correct, production-ready asset for
// its actual role in the engine.
//
// Shape: a low-relief "city block" grid -- flat road surface (y=0) with a small
// curb step (y=CURB_HEIGHT) everywhere that isn't road, based on the exact same
// road-network math used for the ground mask texture (road-network.mjs), so the
// physical collider and the visual mask stay in agreement.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadLayout, roadInsideness } from './road-network.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const layout = loadLayout()

const SEGMENTS = 128 // matches the previous Terrain.js "subdivision" convention
const ROWS = SEGMENTS + 1 // 129 -> 129*129 = 16641 vertices, a perfect square (required by Floor.js's heightfield reader)
const HALF_EXTENT = layout.worldFootprint.halfExtent // 130 -> matches Terrain.js's new `size` (260) / 2
const CURB_HEIGHT = 0.15 // matches the curb bump magnitude used in Floor.js's new positionNode displacement

const vertexCount = ROWS * ROWS
const positions = new Float32Array(vertexCount * 3)

let minY = Infinity
let maxY = -Infinity

for(let row = 0; row < ROWS; row++)
{
    const z = -HALF_EXTENT + row * (HALF_EXTENT * 2 / SEGMENTS)

    for(let col = 0; col < ROWS; col++)
    {
        const x = -HALF_EXTENT + col * (HALF_EXTENT * 2 / SEGMENTS)
        const isRoad = roadInsideness(x, z, layout) >= 0
        const y = isRoad ? 0 : CURB_HEIGHT

        const i = (row * ROWS + col) * 3
        positions[i + 0] = x
        positions[i + 1] = y
        positions[i + 2] = z

        if(y < minY) minY = y
        if(y > maxY) maxY = y
    }
}

// Two triangles per grid cell. Winding/order is irrelevant to Floor.js (which only
// reads the POSITION accessor), kept consistent for general glTF validity.
const indexCount = SEGMENTS * SEGMENTS * 6
const indices = new Uint16Array(indexCount)
let ii = 0
for(let row = 0; row < SEGMENTS; row++)
{
    for(let col = 0; col < SEGMENTS; col++)
    {
        const a = row * ROWS + col
        const b = row * ROWS + col + 1
        const c = (row + 1) * ROWS + col
        const d = (row + 1) * ROWS + col + 1

        indices[ii++] = a
        indices[ii++] = c
        indices[ii++] = b

        indices[ii++] = b
        indices[ii++] = c
        indices[ii++] = d
    }
}

const positionsBuffer = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength)
const indicesBuffer = Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength)

// positionsBuffer.byteLength is always a multiple of 4 (Float32 * 3), so the
// indices bufferView starts already 4-byte (and therefore 2-byte) aligned.
const binUnpadded = Buffer.concat([ positionsBuffer, indicesBuffer ])
const binPadding = (4 - (binUnpadded.length % 4)) % 4
const bin = binPadding === 0 ? binUnpadded : Buffer.concat([ binUnpadded, Buffer.alloc(binPadding) ])

const gltf = {
    asset: { version: '2.0', generator: 'cyber-city-phase-b/generate-terrain-model.mjs' },
    scene: 0,
    scenes: [ { nodes: [ 0 ] } ],
    nodes: [ { mesh: 0, name: 'CyberCityTerrain' } ],
    meshes: [
        {
            name: 'CyberCityTerrain',
            primitives: [ { attributes: { POSITION: 0 }, indices: 1, mode: 4 } ]
        }
    ],
    accessors: [
        {
            bufferView: 0,
            componentType: 5126, // FLOAT
            count: vertexCount,
            type: 'VEC3',
            min: [ -HALF_EXTENT, minY, -HALF_EXTENT ],
            max: [ HALF_EXTENT, maxY, HALF_EXTENT ]
        },
        {
            bufferView: 1,
            componentType: 5123, // UNSIGNED_SHORT
            count: indexCount,
            type: 'SCALAR'
        }
    ],
    bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: positionsBuffer.byteLength, target: 34962 },
        { buffer: 0, byteOffset: positionsBuffer.byteLength, byteLength: indicesBuffer.byteLength, target: 34963 }
    ],
    buffers: [ { byteLength: binUnpadded.length } ]
}

const jsonUnpadded = Buffer.from(JSON.stringify(gltf), 'utf8')
const jsonPadding = (4 - (jsonUnpadded.length % 4)) % 4
const json = jsonPadding === 0 ? jsonUnpadded : Buffer.concat([ jsonUnpadded, Buffer.alloc(jsonPadding, 0x20) ])

const jsonChunkHeader = Buffer.alloc(8)
jsonChunkHeader.writeUInt32LE(json.length, 0)
jsonChunkHeader.write('JSON', 4, 'ascii')

const binChunkHeader = Buffer.alloc(8)
binChunkHeader.writeUInt32LE(bin.length, 0)
binChunkHeader.write('BIN\0', 4, 'ascii')

const totalLength = 12 + jsonChunkHeader.length + json.length + binChunkHeader.length + bin.length

const glbHeader = Buffer.alloc(12)
glbHeader.write('glTF', 0, 'ascii')
glbHeader.writeUInt32LE(2, 4)
glbHeader.writeUInt32LE(totalLength, 8)

const glb = Buffer.concat([ glbHeader, jsonChunkHeader, json, binChunkHeader, bin ])

const outputPath = path.join(here, '..', '..', '..', 'static', 'terrain', 'terrain.glb')
writeFileSync(outputPath, glb)

console.log(`Wrote ${outputPath} (${glb.length} bytes, ${vertexCount} vertices, ${indexCount / 3} triangles)`)
console.log(`Height range: ${minY} .. ${maxY} (road=0, curb=${CURB_HEIGHT})`)
