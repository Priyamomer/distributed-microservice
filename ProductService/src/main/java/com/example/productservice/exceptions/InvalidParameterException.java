package com.example.productservice.exceptions;

public class InvalidParameterException extends Exception{
    public InvalidParameterException(String message){
        super(message);
    }
}
