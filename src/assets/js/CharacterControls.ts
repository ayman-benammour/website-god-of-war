// IMPORT
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Q, D, DIRECTIONS, S, Z } from './Utils'

    // EXPORT
    export class CharacterControls {

    model: THREE.Group
    mixer: THREE.AnimationMixer
    animationsMap: Map<string, THREE.AnimationAction> = new Map() // Walk, Run, Idle
    orbitControl: OrbitControls
    camera: THREE.Camera

    // STATUS
    toggleRun: boolean = true
    toggleRage: boolean = false
    currentAction: string
    
    // TEMPORARY INFOS
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    
    // CONSTANT INFOS
    fadeDuration: number = 0.2
    moveVelocity: number
    playingRage: boolean = false

    constructor(model: THREE.Group,
        mixer: THREE.AnimationMixer, animationsMap: Map<string, THREE.AnimationAction>,
        orbitControl: OrbitControls, camera: THREE.Camera,
        currentAction: string) {
        this.model = model
        this.mixer = mixer
        this.mixer.addEventListener('finished', () => 
        {
            if (this.currentAction == 'Rage')
            {
                this.playingRage = false
            }
        })
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        const rageAction = this.animationsMap.get('Rage')
        rageAction.loop = THREE.LoopOnce
        rageAction.clampWhenFinished = true
        this.animationsMap.forEach((value, key) =>
        {
            if (key == currentAction) 
            {
                value.play()
            }
        })
        this.orbitControl = orbitControl
        this.camera = camera
        this.updateCameraTarget(0,0)
    }

    public switchRunToggle() {
        this.toggleRun = !this.toggleRun
    }

    public switchRageToggle() 
    {
        this.toggleRage = !this.toggleRage
        this.playingRage = true
    }

    public update(delta: number, keysPressed: any) 
    {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

        let play = '';

        if (directionPressed && this.toggleRun)
        {
            if (this.playingRage) 
            {
                this.playingRage = false
            }
            if (this.toggleRage)
            {
                play = 'RunRage'
                this.moveVelocity = 30
            }
            else
            {
                play = 'Run'
                this.moveVelocity = 10
            }
        } 
        else if (directionPressed)
        {
            if (this.playingRage) 
            {
                this.playingRage = false
            }
            this.moveVelocity = 5
            if (this.toggleRage)
            {
                play = 'WalkRage'
            }
            else
            {
                play = 'Walk'
            }
        } 
        else
        {
            if (this.toggleRage)
            {
                if (this.playingRage) 
                {
                    play = 'Rage'
                }
                else
                {
                    play = 'IdleRage'
                }
            }
            else
            {
                play = 'Idle'
            }
        }

        if (this.currentAction != play) 
        {
            const toPlay = this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)

            current.fadeOut(this.fadeDuration)
            toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play
        }

        this.mixer.update(delta)

        if (this.currentAction == 'Run' || this.currentAction == 'Walk' || this.currentAction == 'RunRage' || this.currentAction == 'WalkRage')
        {
            // calculate towards camera direction
            let angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))
            // diagonal movement angle offset
            let directionOffset = this.directionOffset(keysPressed)

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.1)

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // // run/walk velocity
            // const velocity = this.currentAction == 'Run' ? this.moveVelocity : this.walkVelocity || this.currentAction == 'RunRage' ? this.runVelocity : this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * this.moveVelocity * delta
            const moveZ = this.walkDirection.z * this.moveVelocity * delta
            this.model.position.x += moveX
            this.model.position.z += moveZ
            this.updateCameraTarget(moveX, moveZ)
        }
    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ

        // update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y + 3
        this.cameraTarget.z = this.model.position.z
        this.orbitControl.target = this.cameraTarget
    }

    private directionOffset(keysPressed: any) {
        let directionOffset = 0 // Z

        if (keysPressed[Z]) {
            if (keysPressed[Q]) {
                directionOffset = Math.PI / 4 // Z+Q
            } else if (keysPressed[D]) {
                directionOffset = - Math.PI / 4 // Z+D
            }
        } else if (keysPressed[S]) {
            if (keysPressed[Q]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // S+Q
            } else if (keysPressed[D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // S+D
            } else {
                directionOffset = Math.PI // S
            }
        } else if (keysPressed[Q]) {
            directionOffset = Math.PI / 2 // Q
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // D
        }

        return directionOffset
    }
}
