export const validateCommunityAction = (token: string | null) => {
    if (!token) {
        alert('Identifícate o regístrate para poder participar e interactuar con la comunidad.');
        return false;
    }
    return true;
};
