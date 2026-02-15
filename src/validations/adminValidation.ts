export const validateAdminAction = (user: any, token: string | null) => {
    if (!token || user?.role !== 'Admin') {
        alert('No tienes permisos suficientes para realizar esta acción administrativa.');
        return false;
    }
    return true;
};
