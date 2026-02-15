export const validateProjectAction = (token: string | null) => {
    if (!token) {
        alert('Identifícate o regístrate para poder participar en nuestros proyectos.');
        return false;
    }
    return true;
};
