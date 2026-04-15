package com.example.productservice.exceptions;

import org.aspectj.bridge.IMessage;

public class AlreadyExistException extends Exception{
    public AlreadyExistException(String message){
        super(message);
    }
}
