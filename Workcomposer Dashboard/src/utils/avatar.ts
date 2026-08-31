export const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://")
    ) {
        return avatar;
    }

    return `${process.env.NEXT_PUBLIC_API_ORIGIN}/${avatar}`;
};