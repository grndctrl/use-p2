import {createContext} from 'react'

import type {ContactMaterialOptions, MaterialOptions, RayOptions} from 'p2-es'
import type {MutableRefObject} from 'react'
import type {Object3D} from 'three'
import type {ProviderProps, WorkerCollideEvent, WorkerRayhitEvent} from './Provider'
import type {
    AtomicProps,
    BodyProps,
    BodyShapeType,
    ConstraintTypes,
    Quad,
    SpringOptns,
    WheelOptions,
} from './hooks'
import type {Duplet} from './hooks'

export type Buffers = { positions: Float32Array; quaternions: Float32Array }
export type Refs = { [uuid: string]: Object3D }
type WorkerContact = WorkerCollideEvent['data']['contact']
export type CollideEvent = Omit<WorkerCollideEvent['data'], 'body' | 'target' | 'contact'> & {
    body: Object3D
    target: Object3D
    contact: Omit<WorkerContact, 'bi' | 'bj'> & {
        bi: Object3D
        bj: Object3D
    }
}
export type CollideBeginEvent = {
    op: 'event'
    type: 'collideBegin'
    target: Object3D
    body: Object3D
    contacts: []
}
export type CollideEndEvent = {
    op: 'event'
    type: 'collideEnd'
    target: Object3D
    body: Object3D
}
export type RayhitEvent = Omit<WorkerRayhitEvent['data'], 'body'> & { body: Object3D | null }

type CannonEvent = CollideBeginEvent | CollideEndEvent | CollideEvent | RayhitEvent
type CallbackByType<T extends { type: string }> = {
    [K in T['type']]?: T extends { type: K } ? (e: T) => void : never
}

type CannonEvents = { [uuid: string]: Partial<CallbackByType<CannonEvent>> }

export type Subscription = Partial<{ [K in SubscriptionName]: (value: PropValue<K>) => void }>
export type Subscriptions = Partial<{
    [id: number]: Subscription
}>

export type PropValue<T extends SubscriptionName = SubscriptionName> = T extends AtomicName
    ? AtomicProps[T]
    : T extends VectorName
        ? Duplet
        : T extends 'quaternion'
            ? Quad
            : never

export const atomicNames = [
    'allowSleep',
    'angle',
    'angularDamping',
    'collisionFilterGroup',
    'collisionFilterMask',
    'collisionResponse',
    'fixedRotation',
    'isTrigger',
    'linearDamping',
    'mass',
    'material',
    'sleepSpeedLimit',
    'sleepTimeLimit',
    'userData',
] as const
export type AtomicName = typeof atomicNames[number]

export const vectorNames = [
    'angularFactor',
    'angularVelocity',
    'linearFactor',
    'position',
    'velocity',
] as const
export type VectorName = typeof vectorNames[number]

export const subscriptionNames = [
    ...atomicNames,
    ...vectorNames,
    'quaternion',
    'collisions',
    'raysData',
] as const
export type SubscriptionName = typeof subscriptionNames[number]

export type SetOpName<T extends AtomicName | VectorName | WorldPropName | 'quaternion' | 'rotation'> =
    `set${Capitalize<T>}`

type Operation<T extends string, P> = { op: T } & (P extends void ? {} : { props: P })
type WithUUID<T extends string, P = void> = Operation<T, P> & { uuid: string }
type WithUUIDs<T extends string, P = void> = Operation<T, P> & { uuid: string[] }

type AddConstraintMessage = WithUUID<'addConstraint', [uuidA: string, uuidB: string, options: {}]> & {
    type: 'Hinge' | ConstraintTypes
}

type DisableConstraintMessage = WithUUID<'disableConstraint'>
type EnableConstraintMessage = WithUUID<'enableConstraint'>
type RemoveConstraintMessage = WithUUID<'removeConstraint'>

type ConstraintMessage =
    | AddConstraintMessage
    | DisableConstraintMessage
    | EnableConstraintMessage
    | RemoveConstraintMessage

type DisableConstraintMotorMessage = WithUUID<'disableConstraintMotor'>
type EnableConstraintMotorMessage = WithUUID<'enableConstraintMotor'>
type SetConstraintMotorMaxForce = WithUUID<'setConstraintMotorMaxForce', number>
type SetConstraintMotorSpeed = WithUUID<'setConstraintMotorSpeed', number>

type ConstraintMotorMessage =
    | DisableConstraintMotorMessage
    | EnableConstraintMotorMessage
    | SetConstraintMotorSpeed
    | SetConstraintMotorMaxForce

type AddSpringMessage = WithUUID<'addSpring', [uuidA: string, uuidB: string, options: SpringOptns]>
type RemoveSpringMessage = WithUUID<'removeSpring'>

type SetSpringDampingMessage = WithUUID<'setSpringDamping', number>
type SetSpringRestLengthMessage = WithUUID<'setSpringRestLength', number>
type SetSpringStiffnessMessage = WithUUID<'setSpringStiffness', number>

type SpringMessage =
    | AddSpringMessage
    | RemoveSpringMessage
    | SetSpringDampingMessage
    | SetSpringRestLengthMessage
    | SetSpringStiffnessMessage

export type AddContactMaterialMessage = WithUUID<
    'addContactMaterial',
    [materialA: MaterialOptions, materialB: MaterialOptions, options: ContactMaterialOptions]
    >
type RemoveContactMaterialMessage = WithUUID<'removeContactMaterial'>
type ContactMaterialMessage = AddContactMaterialMessage | RemoveContactMaterialMessage

export type RayMode = 'Closest' | 'Any' | 'All'

export type AddRayMessage = WithUUID<'addRay', {
        from?: Duplet
        mode: RayMode
        to?: Duplet
} & Pick<RayOptions, 'checkCollisionResponse' | 'collisionGroup' | 'collisionMask' | 'skipBackfaces'>>

type RemoveRayMessage = WithUUID<'removeRay'>

type RayMessage = AddRayMessage | RemoveRayMessage

type AddTopDownVehicleMessage = WithUUIDs<'addTopDownVehicle', [
    chassisBodyUUID: string,
    wheelInfos: WheelOptions[],
]>
type RemoveTopDownVehicleMessage = WithUUIDs<'removeTopDownVehicle'>

type ApplyTopDownVehicleEngineForceMessage = WithUUID<'applyTopDownVehicleEngineForce', [
    value: number,
    wheelIndex: number
]>
type SetTopDownVehicleBrakeMessage = WithUUID<'setTopDownVehicleBrake', [brake: number, wheelIndex: number]>
type SetTopDownVehicleSteeringValueMessage = WithUUID<'setTopDownVehicleSteeringValue', [value: number, wheelIndex: number]>

type TopDownVehicleMessage =
    | AddTopDownVehicleMessage
    | ApplyTopDownVehicleEngineForceMessage
    | RemoveTopDownVehicleMessage
    | SetTopDownVehicleBrakeMessage
    | SetTopDownVehicleSteeringValueMessage


type AddKinematicCharacterControllerMessage = WithUUIDs<'addKinematicCharacterController', [
    bodyUUID: string,
    collisionMask: number,
    accelerationTimeAirborne?: number,
    accelerationTimeGrounded?: number,
    moveSpeed?: number,
    wallSlideSpeedMax?: number,
    wallStickTime?: number,
    wallJumpClimb?: Duplet,
    wallJumpOff?: Duplet,
    wallLeap?: Duplet,
    timeToJumpApex?: number,
    maxJumpHeight?: number,
    minJumpHeight?: number,
    velocityXSmoothing?: number,
    velocityXMin?: number,
    maxClimbAngle?: number,
    maxDescendAngle?: number,
    skinWidth?: number,
    dstBetweenRays?: number,
]>
type RemoveKinematicCharacterControllerMessage = WithUUIDs<'removeKinematicCharacterController'>
type SetKinematicCharacterControllerJumpMessage = WithUUID<'setKinematicCharacterControllerJump', [isDown: boolean]>
type SetKinematicCharacterControllerInputMessage = WithUUID<'setKinematicCharacterControllerInput', [input: [x: number, y: number]]>

type KinematicCharacterControllerMessage =
    | AddKinematicCharacterControllerMessage
    | RemoveKinematicCharacterControllerMessage
    | SetKinematicCharacterControllerJumpMessage
    | SetKinematicCharacterControllerInputMessage

type AddPlatformControllerMessage = WithUUIDs<'addPlatformController', [
    bodyUUID: string,
    passengerMask: number,
    localWaypoints: Duplet[],
    speed?: number,
    skinWidth?: number,
    dstBetweenRays?: number,
]>
type RemovePlatformControllerMessage = WithUUIDs<'removePlatformController'>

type PlatformControllerMessage =
    | AddPlatformControllerMessage
    | RemovePlatformControllerMessage


type AtomicMessage = WithUUID<SetOpName<AtomicName>, any>
type QuaternionMessage = WithUUID<SetOpName<'quaternion'>, Quad>
type RotationMessage = WithUUID<SetOpName<'rotation'>, number>
type VectorMessage = WithUUID<SetOpName<VectorName>, Duplet>

type ApplyForceMessage = WithUUID<'applyForce', [force: Duplet, worldPoint: Duplet]>
type ApplyImpulseMessage = WithUUID<'applyImpulse', [impulse: Duplet, worldPoint: Duplet]>
type ApplyLocalForceMessage = WithUUID<'applyLocalForce', [force: Duplet, localPoint: Duplet]>
type ApplyLocalImpulseMessage = WithUUID<'applyLocalImpulse', [impulse: Duplet, localPoint: Duplet]>
type ApplyTorque = WithUUID<'applyTorque', [torque: Duplet]>

type ApplyMessage =
    | ApplyForceMessage
    | ApplyImpulseMessage
    | ApplyLocalForceMessage
    | ApplyLocalImpulseMessage
    | ApplyTorque

type SerializableBodyProps = {
    onCollide: boolean
}

type AddBodiesMessage = WithUUIDs<'addBodies', SerializableBodyProps[]> & { type: BodyShapeType }
type RemoveBodiesMessage = WithUUIDs<'removeBodies'>

type BodiesMessage = AddBodiesMessage | RemoveBodiesMessage

type SleepMessage = WithUUID<'sleep'>
type WakeUpMessage = WithUUID<'wakeUp'>

export type SubscriptionTarget = 'bodies' | 'vehicles' | 'controllers'

type SubscribeMessage = WithUUID<'subscribe', {
        id: number
        target: SubscriptionTarget
        type: SubscriptionName
}>
type UnsubscribeMessage = Operation<'unsubscribe', number>

type SubscriptionMessage = SubscribeMessage | UnsubscribeMessage

export type WorldPropName = 'axisIndex' | 'broadphase' | 'gravity' | 'iterations' | 'step' | 'tolerance'

type WorldMessage<T extends WorldPropName> = Operation<SetOpName<T>, Required<ProviderProps[T]>>

type CannonMessage =
    | ApplyMessage
    | AtomicMessage
    | BodiesMessage
    | ConstraintMessage
    | ConstraintMotorMessage
    | QuaternionMessage
    | TopDownVehicleMessage
    | KinematicCharacterControllerMessage
    | PlatformControllerMessage
    | RayMessage
    | RotationMessage
    | SleepMessage
    | SpringMessage
    | ContactMaterialMessage
    | SubscriptionMessage
    | VectorMessage
    | WakeUpMessage
    | WorldMessage<WorldPropName>

export interface CannonWorker extends Worker {
    postMessage: (message: CannonMessage) => void
}

export type ProviderContext = {
    worker: CannonWorker
    bodies: MutableRefObject<{ [uuid: string]: number }>
    buffers: Buffers
    refs: Refs
    events: CannonEvents
    subscriptions: Subscriptions
}

export type DebugApi = {
    add(id: string, props: BodyProps, type: BodyShapeType): void
    remove(id: string): void
}

export const context = createContext<ProviderContext>({} as ProviderContext)
export const debugContext = createContext<DebugApi>(null!)
