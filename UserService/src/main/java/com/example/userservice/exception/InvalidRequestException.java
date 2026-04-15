package com.example.userservice.exception;

public class InvalidRequestException extends Exception{
    public InvalidRequestException (String message){
        super(message);
    }
}
