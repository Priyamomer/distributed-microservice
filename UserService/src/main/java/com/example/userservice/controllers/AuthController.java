package com.example.userservice.controllers;

import com.example.userservice.dtos.ChangePasswordDto;
import com.example.userservice.dtos.SignupRequestDto;
import com.example.userservice.dtos.UserDto;
import com.example.userservice.exception.InvalidParameterException;
import com.example.userservice.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {
    private AuthService authService;
    @Autowired
    private  AuthController (AuthService authService){
        this.authService=authService;
    }
    @PostMapping("/signup")
    public ResponseEntity<UserDto> signup(@RequestBody SignupRequestDto signupRequestDto) throws InvalidParameterException {
        System.out.println("Signup user is been triggered");
        return authService.signUp(signupRequestDto.getEmail(),signupRequestDto.getPassword());
    }
    @PostMapping("/password")
    public ResponseEntity<String> changeUserPassword(@RequestBody ChangePasswordDto changePasswordDto) throws InvalidParameterException {
        String response=authService.changeUserPassword(changePasswordDto.getEmail(), changePasswordDto.getOldPassword(), changePasswordDto.getNewPassword());
        return ResponseEntity.ok(response);
    }
}
