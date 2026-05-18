package com.devskills.security;

// Concrete Strategies
class AdminRoleStrategy implements RoleStrategy {
    public String getRoleName() { return "ADMIN"; }
    public boolean canAccessDashboard() { return true; }
    public boolean canManageUsers() { return true; }
}

class DevRoleStrategy implements RoleStrategy {
    public String getRoleName() { return "DEV"; }
    public boolean canAccessDashboard() { return true; }
    public boolean canManageUsers() { return false; }
}

class ClientRoleStrategy implements RoleStrategy {
    public String getRoleName() { return "CLIENT"; }
    public boolean canAccessDashboard() { return false; }
    public boolean canManageUsers() { return false; }
}

// Context
public class UserContext {
    private RoleStrategy roleStrategy;

    public UserContext(String roleFromJwt) {
        if (roleFromJwt == null) {
            this.roleStrategy = new ClientRoleStrategy();
            return;
        }
        
        this.roleStrategy = switch (roleFromJwt.toUpperCase()) {
            case "ADMIN" -> new AdminRoleStrategy();
            case "DEV" -> new DevRoleStrategy();
            default -> new ClientRoleStrategy();
        };
    }

    public boolean checkDashboardAccess() {
        return roleStrategy.canAccessDashboard();
    }
    
    public boolean checkUserManagementAccess() {
        return roleStrategy.canManageUsers();
    }
}
