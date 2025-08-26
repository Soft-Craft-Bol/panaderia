import { getUser } from "../utils/authFunctions";

const usePermissions = () => {
  const user = getUser();
  
  const hasPermission = (requiredPermissions = []) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => user?.permissions?.includes(perm));
  };

  return { hasPermission };
};

export default usePermissions;