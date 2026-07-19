import * as THREE from 'three/webgpu'

// Builds one merged BufferGeometry from a list of axis-aligned boxes (a cheap
// stand-in for a real boolean union -- internal faces where boxes overlap are
// simply left in place, invisible from outside, which is a normal simplification
// for a stylized low-poly shape). Per-face winding/normals follow the same
// derivation already verified (zero mismatches across thousands of triangles)
// in Buildings.js's pushBox -- reused here for Phase F's vehicle body instead
// of duplicating that logic a third time.
//
// Each box: { centerX, centerY, centerZ, halfLength (X), halfHeight (Y), halfWidth (Z) }.
// UV.u = distance along each face's own width in world units, UV.v = absolute
// local Y (matches the convention used elsewhere in this codebase).
export function buildBoxUnionGeometry(boxes)
{
    const positions = []
    const uvs = []
    const normals = []
    const indices = []
    let vertexCount = 0

    for(const box of boxes)
    {
        const { centerX, centerY, centerZ, halfLength, halfHeight, halfWidth } = box
        const minY = centerY - halfHeight
        const maxY = centerY + halfHeight

        const faces = [
            { normal: [ 0, 0, 1 ],  a: [ centerX - halfLength, centerZ + halfWidth ], b: [ centerX + halfLength, centerZ + halfWidth ] }, // +Z
            { normal: [ 0, 0, -1 ], a: [ centerX + halfLength, centerZ - halfWidth ], b: [ centerX - halfLength, centerZ - halfWidth ] }, // -Z
            { normal: [ 1, 0, 0 ],  a: [ centerX + halfLength, centerZ + halfWidth ], b: [ centerX + halfLength, centerZ - halfWidth ] }, // +X
            { normal: [ -1, 0, 0 ], a: [ centerX - halfLength, centerZ - halfWidth ], b: [ centerX - halfLength, centerZ + halfWidth ] }, // -X
        ]

        for(const face of faces)
        {
            const [ ax, az ] = face.a
            const [ bx, bz ] = face.b
            const width = Math.hypot(bx - ax, bz - az)
            const startIndex = vertexCount

            positions.push(ax, minY, az); uvs.push(0, minY); normals.push(...face.normal)
            positions.push(bx, minY, bz); uvs.push(width, minY); normals.push(...face.normal)
            positions.push(bx, maxY, bz); uvs.push(width, maxY); normals.push(...face.normal)
            positions.push(ax, maxY, az); uvs.push(0, maxY); normals.push(...face.normal)
            vertexCount += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }

        // Top face
        {
            const startIndex = vertexCount
            const corners = [
                [ centerX - halfLength, centerZ - halfWidth ],
                [ centerX - halfLength, centerZ + halfWidth ],
                [ centerX + halfLength, centerZ + halfWidth ],
                [ centerX + halfLength, centerZ - halfWidth ],
            ]

            for(const [ x, z ] of corners)
            {
                positions.push(x, maxY, z); uvs.push(0, 0); normals.push(0, 1, 0)
            }
            vertexCount += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }

        // Bottom face (the vehicle underside can be glimpsed at steep camera
        // angles/jumps, unlike a building's roof-obscured base, so it's included)
        {
            const startIndex = vertexCount
            const corners = [
                [ centerX - halfLength, centerZ + halfWidth ],
                [ centerX - halfLength, centerZ - halfWidth ],
                [ centerX + halfLength, centerZ - halfWidth ],
                [ centerX + halfLength, centerZ + halfWidth ],
            ]

            for(const [ x, z ] of corners)
            {
                positions.push(x, minY, z); uvs.push(0, 0); normals.push(0, -1, 0)
            }
            vertexCount += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setIndex(indices)

    return geometry
}
