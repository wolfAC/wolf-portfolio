import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

// Phase H retint — see audit/phase-h-implementation-notes.md for the full rationale.
// Names/targets per audit/phase-a1-art-direction-brief.md's "Time of day" table;
// electricField/temperature are Phase I (weather) territory and are left untouched here.
const presets = {
    overcastDusk: { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 5, lightColor: new THREE.Color('#c9d2ff'), lightIntensity: 1.4, shadowColor: new THREE.Color('#6d3fff'), fogColorA: new THREE.Color('#2b2440'), fogColorB: new THREE.Color('#0d0a1a'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    neonDusk:     { revealColor: new THREE.Color('#ff86d9'), revealIntensity: 5.55, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ff8fd6'), lightIntensity: 1.0, shadowColor: new THREE.Color('#4e009c'), fogColorA: new THREE.Color('#3a1f3f'), fogColorB: new THREE.Color('#0d0a1a'), fogNearRatio: 0, fogFarRatio: 1.25 },
    deepNight:    { revealColor: new THREE.Color('#b678ff'), revealIntensity: 10, electricField: 1, temperature: -7.5, lightColor: new THREE.Color('#3240ff'), lightIntensity: 0.6, shadowColor: new THREE.Color('#2f00db'), fogColorA: new THREE.Color('#170f2b'), fogColorB: new THREE.Color('#05030a'), fogNearRatio: -0.85, fogFarRatio: 1 },
    electricDawn: { revealColor: new THREE.Color('#ff9d9d'), revealIntensity: 4.85, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffb27a'), lightIntensity: 1.0, shadowColor: new THREE.Color('#128fb0'), fogColorA: new THREE.Color('#3a2a1f'), fogColorB: new THREE.Color('#0d0a1a'), fogNearRatio: 0.3, fogFarRatio: 1.25 },
}

export class DayCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = import.meta.env.VITE_DAY_CYCLE_PROGRESS ? parseFloat(import.meta.env.VITE_DAY_CYCLE_PROGRESS) : null
        super('🕜 Day Cycles', 4 * 60, forcedProgress, false)
    }

    get presets()
    {
        return presets
    }

    getKeyframesDescriptions()
    {
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'duration', { min: 1, max: 60 * 10, step: 1 })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.revealColor, 'revealColor')
                presetsDebugPanel.addBinding(preset, 'revealIntensity', { min: 0, max: 20, step: 0.001 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.overcastDusk, stop: 0.0 }, // Overcast dusk
                { properties: presets.overcastDusk, stop: 0.15 }, // Overcast dusk
                { properties: presets.neonDusk, stop: 0.25 }, // Neon dusk
                { properties: presets.deepNight, stop: 0.35 }, // Deep night
                { properties: presets.deepNight, stop: 0.6 }, // Deep night
                { properties: presets.electricDawn, stop: 0.8 }, // Electric dawn
                { properties: presets.overcastDusk, stop: 0.9 }, // Overcast dusk
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return [
            { name: 'night', start: 0.25, end: 0.7 },
            { name: 'deepNight', start: 0.35, end: 0.6 },
        ]
    }
}