package com.example.userservice.services;

import com.example.userservice.dtos.RoleDto;
import com.example.userservice.dtos.UserDto;
import com.example.userservice.exception.InvalidParameterException;
import com.example.userservice.models.Role;
import com.example.userservice.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    RoleRepository roleRepository;
    @Autowired
    RoleService(RoleRepository roleRepository){
        this.roleRepository=roleRepository;
    }
    public ResponseEntity<RoleDto> createRole(String name) throws InvalidParameterException {
        Optional<Role> roleOptional= roleRepository.findByRole(name);
        if(roleOptional.isPresent()){
            throw new InvalidParameterException("Role already exists");
        }
        Role role=new Role();
        role.setRole(name);
        roleRepository.save(role);
        RoleDto roleDto=new RoleDto();
        roleDto.setId(role.getId());
        roleDto.setRole(role.getRole());
        return ResponseEntity.ok(roleDto);
    }

    public ResponseEntity<List<RoleDto>> getAllRoles(){
        List<Role> roleList= roleRepository.findAll();
        List<RoleDto> roleDtoList = new ArrayList<>();
        for(Role role:roleList){
            RoleDto roleDto=new RoleDto();
            roleDto.setId(role.getId());
            roleDto.setRole(role.getRole());
            roleDtoList.add(roleDto);
        }
        return new ResponseEntity<>(roleDtoList, HttpStatus.OK);
    }
}
