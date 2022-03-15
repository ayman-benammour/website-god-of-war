// IMPORT
import { CharacterControls } from './CharacterControls'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from 'lil-gui'

export default class Application
{
    constructor()
    {
        // SCENE
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xa8def0)

        // CAMERA
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.y = 5
        camera.position.z = 5
        camera.position.x = 0

        // RENDERER
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        renderer.physicallyCorrectLights = true
        renderer.outputEncoding = THREE.sRGBEncoding
        renderer.toneMapping = THREE.ACESFilmicToneMapping

        // CAMERA CONTROLS
        const orbitControls = new OrbitControls(camera, renderer.domElement)
        orbitControls.enableDamping = true
        orbitControls.minDistance = 8
        orbitControls.maxDistance = 25
        orbitControls.enablePan = false
        orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
        orbitControls.update()

        // SKY
        let sky:any , sun:any

        sky = new Sky()
        sky.scale.setScalar( 450000 )
        scene.add( sky )

        sun = new THREE.Vector3()

        /// GUI
        const effectController =
        {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.975,
            elevation: 0,
            azimuth: -150,
            exposure: 0.7
        }

        function guiChanged() 
        {
            const uniforms = sky.material.uniforms
            uniforms[ 'turbidity' ].value = effectController.turbidity
            uniforms[ 'rayleigh' ].value = effectController.rayleigh
            uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient
            uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG

            const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation )
            const theta = THREE.MathUtils.degToRad( effectController.azimuth )

            sun.setFromSphericalCoords( 1, phi, theta )

            uniforms[ 'sunPosition' ].value.copy( sun )
        }

        guiChanged()

        // ----- LIGHTS -----
        // AMBIENT LIGHT
        scene.add(new THREE.AmbientLight(0xffffff, 0.5))

        // DIRECTIONAL LIGHT
        // const dirLightColor = new THREE.Color( 0xffffff )

        const dirLight = new THREE.DirectionalLight(0xffffff, 3)

        dirLight.position.set(- 100, 150, - 200)
        dirLight.castShadow = true
        dirLight.shadow.camera.top = 200
        dirLight.shadow.camera.bottom = - 200
        dirLight.shadow.camera.left = - 200
        dirLight.shadow.camera.right = 200
        dirLight.shadow.camera.near = 0.1
        dirLight.shadow.camera.far = 400
        dirLight.shadow.mapSize.width = 4096
        dirLight.shadow.mapSize.height = 4096
        dirLight.shadow.bias = - 0.0003
        scene.add(dirLight)

        // MODEL WITH ANIMATIONS
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')

        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        let characterControls: CharacterControls

        // KRATOS
        let isModelLoaded = false

        gltfLoader.load('assets/models/KratosDraco.glb',
            (gltf) =>
            {
                const model = gltf.scene
                model.rotation.y = - Math.PI / 2
                model.traverse(function (object: any)
                {
                    if(object.isMesh)
                    {
                        object.castShadow = true
                        object.receiveShadow = true
                        object.material.metalness = 0
                        object.material.map = object.material.emissiveMap
                        object.material.emissiveMap = null
                        object.material.emissive.set('#000000')
                        if(object.name == '25_Beard_Beard_01_16_16')
                        {
                            object.material.color.set('#000000')
                        }
                    }
                })
                scene.add(model)

                const gltfAnimations: THREE.AnimationClip[] = gltf.animations
                const mixer = new THREE.AnimationMixer(model)
                const animationsMap: Map<string, THREE.AnimationAction> = new Map()
                gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) =>
                {
                    animationsMap.set(a.name, mixer.clipAction(a))
                })

                characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle')

                isModelLoaded = true
                startExperience()
            })

        let isBridgeLoaded = false

        // BRIDGE
        gltfLoader.load('assets/models/bridgeDracoTexturesCompressed.glb',
        (gltf) =>
        {
            const bridge = gltf.scene

            bridge.position.y = - 9.2
            bridge.position.x = 24

            bridge.rotation.y = - Math.PI / 2

            bridge.traverse((object: any) =>
            {
                if(object.isMesh)
                {
                    object.castShadow = true
                    object.receiveShadow = true
                }
            })

            scene.add(bridge)

            isBridgeLoaded = true
            startExperience()
        })

        // DOOR
        gltfLoader.load('assets/models/doorDracoTexturesCompressed.glb',
        (gltf) =>
        {
            const door = gltf.scene

            door.position.x = - 4

            door.rotation.y = Math.PI / 2

            scene.add(door)

            door.traverse((object: any) =>
            {
                if(object.isMesh)
                {
                    object.castShadow = true
                    object.receiveShadow = true
                }
            })
        })

        // CONTROL KEYS
        const keysPressed = { }

        document.addEventListener('keydown', (event) => 
        {
            if (event.shiftKey && characterControls)
            {
                characterControls.switchRunToggle()
            }
            else if (event.ctrlKey && characterControls)
            {
                characterControls.switchRageToggle()
            }
            else
            {
                (keysPressed as any)[event.key.toLowerCase()] = true
            }
        }, false)

        document.addEventListener('keyup', (event) =>
        {
            (keysPressed as any)[event.key.toLowerCase()] = false
        }, false)



        // ANIMATE
        const clock = new THREE.Clock()

        function animate()
        {
            let mixerUpdateDelta = clock.getDelta()
            if (characterControls)
            {
                characterControls.update(mixerUpdateDelta, keysPressed)
            }
            orbitControls.update()
            renderer.render(scene, camera)
            requestAnimationFrame(animate)
        }

        document.body.appendChild(renderer.domElement)
        animate()

        // RESIZE HANDLER
        function onWindowResize()
        {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            // keyDisplayQueue.updatePosition()
        }

        window.addEventListener('resize', onWindowResize)

        const experienceLoadElement = document.querySelector('.experienceLoad')
        const startExperience = () =>
        {
            if(isModelLoaded && isBridgeLoaded)
            {
                experienceLoadElement.classList.remove('isNotLoaded')
                experienceLoadElement.classList.add('isLoaded')

                setTimeout(() => 
                {
                    if (experienceLoadElement.matches('.isLoaded'))
                    {
                        experienceLoadElement.classList.add('hidden')
                    }
                }, 1000)
            }
        }

        // ----- DEBUG -----
        const debug = new GUI()
        debug.hide()
        if(window.location.hash === '#debug')
            debug.show()

        // DIRECTIONAL LIGHT
        const dirLightFolder = debug.addFolder('Directional light')

        dirLightFolder
            .add(dirLight.position, 'y')
            .min(-200)
            .max(200)
        
        dirLightFolder
            .add(dirLight.position, 'x')
            .min(-200)
            .max(200)

        dirLightFolder
            .add(dirLight.position, 'z')
            .min(-200)
            .max(200)

        // SKY
        const skyFolder = debug.addFolder('Sky')
        skyFolder.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged )
        skyFolder.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged )
        skyFolder.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged )
        skyFolder.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged )
        skyFolder.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged )
        skyFolder.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged )
        skyFolder.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged )
    }
} 