package com.example.userservice.services;

import com.example.userservice.dtos.UserDto;
import com.example.userservice.models.Role;
import com.example.userservice.models.User;
import com.example.userservice.repositories.RoleRepository;
import com.example.userservice.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public UserDto getUserDetails(Long userId){
        Optional<User> userOptional=userRepository.findById(userId);
        if(userOptional.isEmpty()){
            return null;
        }
        return UserDto.from(userOptional.get());
    }
    public UserDto setUserRoles(Long userId,List<Long> roleIds){
        Optional<User> userOptional=userRepository.findById(userId);
        List<Role> roles=roleRepository.findAllByIdIn(roleIds);
        if(userOptional.isEmpty()){
            return null;
        }

        User user=userOptional.get();
        System.out.println(user.getEmail());
        user.setRoles(new HashSet<>(roles));
        User savedUser=userRepository.save(user);

        return UserDto.from(savedUser);
    }

}
