import {Canvas} from '@react-three/fiber'
import {
    Physics,
    Debug,
    useBox,
    useCapsule,
    useCircle,
    useConvex,
    useLine,
    useParticle,
    usePlane,
    useHeightfield
} from '@react-three/p2'
import {OrbitControls} from '@react-three/drei'
import {vec2} from 'p2-es'
import type {PropsWithChildren} from 'react'

function Box() {
    const [ref] = useBox(() => ({mass: 1, position: [0, 2]}))
    return (
        <mesh ref={ref}>
            <boxGeometry />
            <meshNormalMaterial />
        </mesh>
    )
}

function Capsule() {
    const [ref] = useCapsule(() => ({mass: 1, position: [2, 3], args: [2, 0.3], angle: Math.PI/2-0.01}))
    return (
        <group ref={ref}>
        </group>
    )
}

function Circle() {
    const [ref] = useCircle(() => ({mass: 1, position: [4, 2]}))
    return (
        <mesh ref={ref}>
            <sphereGeometry />
            <meshNormalMaterial />
        </mesh>
    )
}

function Convex() {
    const vertices = [] as number[][]
    for(let i=0, N=5; i<N; i++){
        const a = 2*Math.PI / N * i
        const vertex = [0.5*Math.cos(a), 0.5*Math.sin(a)]
        vertices.push(vertex)
    }
    const [ref] = useConvex(() => ({mass: 1, position: [3.5, 5], args:[vertices]}))
    return (
        <group ref={ref}>
        </group>
    )
}

function Heightfield() {
    const data = [] as number []
    const numDataPoints = 20
    for(let i=0; i<numDataPoints; i++){
        data.push(0.5*Math.cos(0.2*i) * Math.sin(0.5*i) + 0.6*Math.sin(0.1*i) * Math.sin(0.05*i))
    }
    const [ref] = useHeightfield(() => ({mass: 0, position: [-6, 0.2], args: [data, {elementWidth: 0.5}]}))
    return (
        <group ref={ref}>
        </group>
    )
}

function Line() {
    const [ref] = useLine(() => ({mass: 0, args: [10], position: [3, 0], angle: Math.PI/5}))
    return (
        <group ref={ref}>
        </group>
    )
}

function Particle({position, velocity}: PropsWithChildren<{ position: [x: number, y: number], velocity: [x: number, y: number] }>) {
    const [ref] = useParticle(() => ({mass: 0.01, position, velocity}))
    return (
        <group ref={ref}>
        </group>
    )
}

function ParticleSystem() {
    const arr = new Array(10)
        .fill([])
        .map(() => {
            const a = vec2.fromValues(-1+Math.random()*3, 3+Math.random()*3)
            return a
        })
    return <>
        {arr.map((p,i) => <Particle position={p} velocity={p} key={i} />)}
    </>
}

function Plane() {
    const [ref] = usePlane(() => ({mass: 0, position: [0, 0]}))
    return (
        <mesh ref={ref}>
            <boxGeometry args={[10,0.1,10]} />
            <meshNormalMaterial />
        </mesh>
    )
}

export default () => (
    <Canvas camera={{position: [0,0,10]}}>
        <OrbitControls/>
        <Physics normalIndex={2}>
            <Debug normalIndex={2}>
                <Box />
                <Circle />
                <Capsule />
                <Convex />
                <Heightfield />
                <Line />
                <ParticleSystem />
                <Plane />
            </Debug>
        </Physics>
    </Canvas>
)
