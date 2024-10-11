export const parsePathForPostData = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'home' || parts.length === 0) {
        return { space: 'public', privateSpaceId: null, channel: null };
    } else if (parts[0] === 'private' && parts.length >= 2) {
        return {
            space: 'private',
            privateSpaceId: parts[1],
            channel: parts.length >= 3 ? parts[2] : null
        };
    }
    return { space: 'public', privateSpaceId: null, channel: null };
}