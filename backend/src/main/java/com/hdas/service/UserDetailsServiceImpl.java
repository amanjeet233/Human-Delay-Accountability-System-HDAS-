package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (!user.getActive()) {
            throw new UsernameNotFoundException("User is inactive: " + username);
        }
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPasswordHash())
            .authorities(getAuthorities(user))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.getActive())
            .build();
    }
    
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Set<SimpleGrantedAuthority> authorities = new java.util.HashSet<>();
        
        // Add role authorities
        user.getRoles().stream()
            .filter(role -> role.getActive())
            .forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName())));
        
        // Add permission authorities
        Set<String> roleNames = user.getRoles().stream()
            .filter(role -> role.getActive())
            .map(role -> role.getName())
            .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
            .filter(role -> role.getActive())
            .flatMap(role -> role.getPermissions().stream())
            .collect(Collectors.toSet());

        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission)));

        addDerivedAuthorities(authorities, roleNames, permissions);
        
        return authorities;
    }

    private void addDerivedAuthorities(Set<SimpleGrantedAuthority> authorities, Set<String> roleNames, Set<String> permissions) {
        boolean hasAllPermissions = permissions.contains("ALL_PERMISSIONS");
        boolean isAdminRole = roleNames.contains("ADMIN");

        boolean elevatedPermission = permissions.stream().anyMatch(p ->
            p.startsWith("MANAGE_") ||
            p.startsWith("CONFIGURE_") ||
            p.startsWith("HANDLE_") ||
            p.startsWith("APPROVE_") ||
            p.startsWith("REVIEW_") ||
            p.startsWith("GENERATE_")
        );

        if (hasAllPermissions || isAdminRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_UPDATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_DELETE"));

            authorities.add(new SimpleGrantedAuthority("ROLE_USER_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_UPDATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_DELETE"));
            return;
        }

        if (permissions.stream().anyMatch(p -> p.startsWith("READ_")) || elevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_READ"));
        }
        if (permissions.stream().anyMatch(p -> p.startsWith("CREATE_")) || elevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_CREATE"));
        }
        if (permissions.stream().anyMatch(p -> p.startsWith("UPDATE_") || p.startsWith("APPROVE_") || p.startsWith("HANDLE_") || p.startsWith("MANAGE_") || p.startsWith("CONFIGURE_") || p.startsWith("REVIEW_")) || elevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_UPDATE"));
        }
        if (permissions.stream().anyMatch(p -> p.startsWith("DELETE_"))) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_DELETE"));
        }

        if (elevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_UPDATE"));
        }
    }
}
