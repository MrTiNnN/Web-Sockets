import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import Iphone from './components/Iphone/Iphone'
import { a, useSpring } from '@react-spring/three'
import { useControls } from 'leva'
import Circles from './components/Circles/Circles'
import Message from '../../../../components/Message/Message'

const HeroImage = () => {
    const { x, y, z } = useControls("position", {
        x: {
            value: 0,
            min: -10,
            max: 10
        },
        y: {
            value: 0,
            min: -10,
            max: 10
        },
        z: {
            value: 0,
            min: -10,
            max: 10
        },
    })

    return (
        <div className='hero-image-canva'>
            <Canvas
                camera={{
                    fov: 75,
                    far: 2000,
                    near: 0.01
                }}
            >
                <OrbitControls />

                <axesHelper />

                {/* <pointLight /> */}
                <ambientLight />
                <directionalLight intensity={2} position={[0, 0, 2]} />

                <group>
                    <group scale={1.5}>
                        <Iphone
                            position={[-0.15, -1.4, 0.1]}
                        />
                        <Circles />
                    </group>

                    <group position={[0.2, 0.2, 0]}>
                        <Html position={[0.1, 2, 0]} scale={[0.3, 0.3]}>
                            <div style={{width: "20rem"}} className={`message-box out`}>
                                <p>I am very pleased to talk with you today, madam</p>
                            </div>
                        </Html>
                        <Html position={[-1.8, 0.8, 0]} scale={[0.3, 0.3]}>
                            <div style={{width: "14rem"}} className={`message-box in`}>
                                <p>Hello there!</p>
                            </div>
                        </Html>
                        <Html position={[0.0, 0, 0]} scale={[0.3, 0.3]}>
                            <div style={{width: "24rem"}} className={`message-box out`}>
                                <p>Hello! what do you want to do today?</p>
                            </div>
                        </Html>
                        <Html position={[-2.8, -1, 0]} scale={[0.3, 0.3]}>
                            <div style={{width: "24rem"}} className={`message-box in`}>
                                <p>Hmm... maybe a nice restaurant?</p>
                            </div>
                        </Html>
                        <Html position={[0, -2, 0]} scale={[0.3, 0.3]}>
                            <div style={{width: "14rem"}} className={`message-box out`}>
                                <p>I am coming to you.</p>
                            </div>
                        </Html>
                    </group>
                </group>
                {/* <mesh position-y={iphoneSpring.positionY}>
                    <boxGeometry />
                    <meshStandardMaterial color={'red'} />
                </mesh> */}
            </Canvas>
        </div>
    )
}

export default HeroImage