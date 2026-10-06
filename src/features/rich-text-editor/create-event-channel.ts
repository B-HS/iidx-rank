/**
 * Creates a minimal publish/subscribe channel that carries events from non-React code to a subscriber.
 * @returns `emit` to publish a payload and `subscribe` to listen, which returns the unsubscribe function
 */
export const createEventChannel = <Payload>() => {
    const listeners = new Set<(payload: Payload) => void>()

    return {
        emit: (payload: Payload) => listeners.forEach((listener) => listener(payload)),
        subscribe: (listener: (payload: Payload) => void) => {
            listeners.add(listener)

            return () => {
                listeners.delete(listener)
            }
        },
    }
}
