package com.example.userservice.security;

import com.example.userservice.models.Role;
import com.example.userservice.models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@JsonDeserialize(as=CustomUserDetails.class)
public class CustomUserDetails implements UserDetails {
    private User user;
    CustomUserDetails(){
    }
    CustomUserDetails(User user){
        this.user=user;
    }
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<CustomGrantedAuthority> customGrantedAuthorityList=new ArrayList<>();
        Set<Role> roleSet= user.getRoles();
        for(Role role:roleSet){
            CustomGrantedAuthority customGrantedAuthority=new CustomGrantedAuthority(role);
            customGrantedAuthorityList.add(customGrantedAuthority);
        }
        return customGrantedAuthorityList;

    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }
}
