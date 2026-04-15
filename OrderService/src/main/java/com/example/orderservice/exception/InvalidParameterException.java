package com.example.orderservice.exception;

public class InvalidParameterException extends Exception{
    public InvalidParameterException(String message){
        super(message);
    }
}
