import {Canvas} from '@react-three/fiber'
import {Physics, useBox, useCircle, useContactMaterial} from '@react-three/p2'
import React from "react";

const colors = [
    0xff0000,
    0x2f3e46, // ground
    0x4ecdc4, // slippery
    0x2f3e46, // rubber
    0xff6b6b, // bouncy
]

function Box(props) {
    const [ref] = useBox(() => ({
        type: 'Kinematic',
        args: props.args,
        position: props.position,
        angle: props.angle,
        material: props.material,
    }))

    return (
        <mesh ref={ref}>
            <boxGeometry args={[...props.args,1]} />
            <meshBasicMaterial color={colors[props.material.id]}/>
        </mesh>
    )
}

function FallingBox(props) {
    const [ref] = useBox(() => ({
        mass: 3,
        args: props.args,
        position: props.position,
        material: props.material,
        angularDamping: 0.9,
    }))
    return (
        <mesh ref={ref}>
            <boxBufferGeometry args={[...props.args,.5]}/>
            <meshBasicMaterial color={colors[props.material.id]}/>
        </mesh>
    )
}

function Flummi(props) {
    const [ref] = useCircle(() => ({
        mass: 3,
        args: [.25],
        position: props.position,
        material: props.material,
        //angularDamping: 0.9,
    }))
    return (
        <mesh ref={ref}>
            <sphereBufferGeometry args={[.25]}/>
            <meshBasicMaterial color={colors[props.material.id]}/>
        </mesh>
    )
}

const FrictionScene = () => {

    const boxMaterial = {id: 5}

    const groundMaterial = {
        id: 1,
    }
    const slipperyMaterial = {
        id: 2,
        /*
        Friction for this material.
        If non-negative, it will be used instead of the friction given by ContactMaterials.
        If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
        */
        friction: 0,
    }
    const rubberMaterial = {
        id: 3,
        /*
        Setting the friction on both materials prevents overriding the friction given by ContactMaterials.
        Since we want rubber to not be slippery we do not set this here and instead use a ContactMaterial.
        See https://github.com/pmndrs/cannon-es/blob/e9f1bccd8caa250cc6e6cdaf85389058e1c9238e/src/world/World.ts#L661-L673
        */
        // friction: 0.9,
    }
    const bouncyMaterial = {
        id: 4,
        /*
        Restitution for this material.
        If non-negative, it will be used instead of the restitution given by ContactMaterials.
        If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
        */
        restitution: 1.1,
    }

    useContactMaterial(groundMaterial, groundMaterial, {
        friction: 0.4,
        restitution: 0.3,
        stiffness: 1e8,
        relaxation: 3,
        frictionStiffness: 1e8,
    })
    useContactMaterial(boxMaterial, groundMaterial, {
        friction: 0.4,
        restitution: 0.3,
        stiffness: 1e8,
        relaxation: 3,
        frictionStiffness: 1e8,
    })

    useContactMaterial(boxMaterial, slipperyMaterial, {
        friction: 0,
        restitution: 0.3,
    })
    useContactMaterial(groundMaterial, slipperyMaterial, {
        friction: 0,
        restitution: 0.3,
    })
    useContactMaterial(slipperyMaterial, slipperyMaterial, {
        friction: 0.1,
        restitution: 0.3,
    })

    useContactMaterial(bouncyMaterial, slipperyMaterial, {
        friction: 0,
        restitution: 0.8,
    })
    useContactMaterial(bouncyMaterial, groundMaterial, {
        restitution: 0.9,
    })
    useContactMaterial(bouncyMaterial, bouncyMaterial, {
        restitution: 1.5,
    })

    useContactMaterial(rubberMaterial, slipperyMaterial, {
        friction: 0.5,
        restitution: 0.5,
    })
    useContactMaterial(rubberMaterial, rubberMaterial, {
        friction: 1.4,
        restitution: 0.2,
    })
    useContactMaterial(rubberMaterial, bouncyMaterial, {
        friction: 0.9,
        restitution: 0.5,
    })

    return(
        <>
            <Box args={[2,.2]} position={[-3, 0]} angle={0.2} material={slipperyMaterial} />
            <Box args={[2,.2]} position={[-5.7, -1]} angle={-0.252} material={bouncyMaterial} />
            <Box args={[20,.2]} position={[2, -4]} material={rubberMaterial} />

            <Box args={[2,.2]} position={[0, 0]} angle={0.3} material={bouncyMaterial} />
            <Box args={[1.1,.2]} position={[-1.6, -2]} angle={-0.4} material={slipperyMaterial} />

            <Box args={[2,.2]} position={[3.5, -0.5]} angle={0.3} material={bouncyMaterial} />
            <Box args={[2.5,.2]} position={[1.5, -2]} angle={-0.2} material={slipperyMaterial} />

            <Flummi position={[-3, 2.2]} material={bouncyMaterial} />
            <FallingBox position={[0, 3]} args={[.5,.5]} material={rubberMaterial} />
            <FallingBox position={[4, 3]} args={[1,1]} material={slipperyMaterial} />
        </>
    )
}

export default () => (
    <>
        <Canvas camera={{position: [1,-2,10]}}>
            <color attach="background" args={['#ffe66d']}/>

            <Physics normalIndex={2}>
                <FrictionScene />
            </Physics>
        </Canvas>
        <div style={{position: 'absolute', bottom: '50px', left: '50vw', transform: 'translate(-50%, 0)', color: 'white', display: 'none'}}>
            <p>
                Pale is slippery <br/>
                Flamingo is bouncy <br/>
                Black is rubber <br/>
            </p>
        </div>
    </>
)
