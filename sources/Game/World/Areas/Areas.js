import { Game } from '../../Game.js'
import { AltarArea } from './AltarArea.js'
import { CookieArea } from './CookieArea.js'
import { LandingArea } from './LandingArea.js'
import { ProjectsArea } from './ProjectsArea.js'
import { CareerArea } from './CareerArea.js'
import { ToiletArea } from './ToiletArea.js'
import { BowlingArea } from './BowlingArea.js'
import { TimeMachineArea } from './TimeMachineArea.js'
import { EasterArea } from './EasterArea.js'

export class Areas
{
    constructor()
    {
        this.game = Game.getInstance()

        const list = [
            [ 'altar', AltarArea ],
            [ 'bowling', BowlingArea ],
            [ 'career', CareerArea ],
            [ 'cookie', CookieArea ],
            [ 'landing', LandingArea ],
            [ 'projects', ProjectsArea ],
            [ 'toilet', ToiletArea ],
            [ 'timeMachine', TimeMachineArea ],
        ]

        const model = [...this.game.resources.areasModel.scene.children]
        
        for(const child of model)
        {
            for(const [ name, AreaClass ] of list)
            {
                if(child.name.startsWith(name))
                    this[name] = new AreaClass(child)
            }
        }

        // // Test how many areas are visible
        // this.game.ticker.events.on('tick', () =>
        // {
        //     let i = 0
        //     if(this.altar.frustum.isIn)
        //         i++
        //     if(this.bowling.frustum.isIn)
        //         i++
        //     if(this.career.frustum.isIn)
        //         i++
        //     if(this.cookie.frustum.isIn)
        //         i++
        //     if(this.landing.frustum.isIn)
        //         i++
        //     if(this.projects.frustum.isIn)
        //         i++
        //     if(this.toilet.frustum.isIn)
        //         i++

        //     console.log(i)
        // }, 6)
    }
}