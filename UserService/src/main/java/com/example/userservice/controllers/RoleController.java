package com.example.userservice.controllers;

import com.example.userservice.dtos.RoleDto;
import com.example.userservice.dtos.UserDto;
import com.example.userservice.dtos.createRoleRequestDto;
import com.example.userservice.exception.InvalidParameterException;
import com.example.userservice.models.Role;
import com.example.userservice.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.parser.Entity;
import java.util.List;

@RestController
@RequestMapping("/v1/roles")
public class RoleController {
    RoleService roleService;
    @Autowired
    RoleController(RoleService roleService){
        this.roleService=roleService;
    }

    @PostMapping()
    ResponseEntity<RoleDto> createRole(@RequestBody createRoleRequestDto request) throws InvalidParameterException {
        return roleService.createRole(request.getName());
    }
    @GetMapping()
    ResponseEntity<List<RoleDto>> getAllRoles(){
        return roleService.getAllRoles();
    }

}
