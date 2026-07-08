package com.autocare.backend.security;

import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Permission;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.user = user;
        this.authorities = mapAuthorities(user.getRoles());
    }

    public User getUser() {
        return user;
    }

    public UUID getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == AccountStatus.ACTIVE;
    }

    private Collection<? extends GrantedAuthority> mapAuthorities(Collection<Role> roles) {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
        if (roles == null) {
            return grantedAuthorities;
        }

        for (Role role : roles) {
            grantedAuthorities.add(new SimpleGrantedAuthority(role.getName()));
            if (role.getPermissions() != null) {
                for (Permission permission : role.getPermissions()) {
                    grantedAuthorities.add(new SimpleGrantedAuthority(permission.getName()));
                }
            }
        }
        return grantedAuthorities;
    }
}
