export const validateProfileAction = (token: string | null) => {
    if (!token) {
        alert('Debes estar logeado para gestionar tu perfil.');
        return false;
    }
    return true;
};
