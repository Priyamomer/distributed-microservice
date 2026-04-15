package com.example.userservice;

import com.example.userservice.exception.InvalidParameterException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class UserServiceApplication implements CommandLineRunner {
	private final BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	public UserServiceApplication(BCryptPasswordEncoder bCryptPasswordEncoder) {
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;
	}

	public static void main(String[] args)  {

		SpringApplication.run(UserServiceApplication.class, args);
	}
	public void run(String... args) {
		System.out.println(bCryptPasswordEncoder.encode("user"));
	}

}
