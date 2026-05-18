package com.devskills.security;

public interface RoleStrategy {
    String getRoleName();
    boolean canAccessDashboard();
    boolean canManageUsers();
}
