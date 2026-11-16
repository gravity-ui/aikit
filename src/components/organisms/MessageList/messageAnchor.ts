const anonymousIds = new WeakMap<object, string>();
let nextId = 0;

/** Scroll-restoration anchor only; never use object identity for React keys or prepend detection. */
export function getMessageAnchor(message: {id?: string}): string {
    if (message.id !== undefined) {
        return message.id;
    }
    let id = anonymousIds.get(message);
    if (id === undefined) {
        nextId += 1;
        id = `aikit-anonymous-message-${nextId}`;
        anonymousIds.set(message, id);
    }
    return id;
}
