import { a, useSpring, useTrail } from "@react-spring/three"

const Circles = () => {
    const [trail, api] = useTrail(2, () => ({
        from: { scale: 0 },
        to: { scale: 1 },
        config: { duration: 200 }
    }))

    return (
        <group>
            <a.mesh scale={trail[0].scale} position={[0, 0, 0.01]}>
                <circleGeometry args={[2, 128, 0, 6.28]}/>
                <meshBasicMaterial color="#C8DBFF" />
            </a.mesh>
            <a.mesh scale={trail[1].scale} position={[0, 0, 0]}>
                <circleGeometry args={[2.2, 128, 0, 6.28]}/>
                <meshBasicMaterial color="#DEEAFF" />
            </a.mesh>
        </group>
    )
}

export default Circles