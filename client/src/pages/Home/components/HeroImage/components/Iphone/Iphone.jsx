import { a, useSpring } from "@react-spring/three"
import Model from "./components/Model"

const Iphone = ({ position = [0, 0, 0] }) => {
    const iphoneSpring = useSpring({
        from: {
            y: -3
        },
        to: {
            y: 0
        },
        config: {
            friction: 10
        }
    })

    return (
        <group position={[...position]}>
            <a.group position-y={iphoneSpring.y}>
                <Model />
            </a.group>
        </group>
        // <mesh position-y={-5}>
        //     <boxGeometry />
        //     <meshStandardMaterial color={'red'} />
        // </mesh>
    )
}

export default Iphone