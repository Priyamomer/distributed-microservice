package com.example.productservice.exceptions;


import com.example.productservice.dtos.ExceptionDto;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestController
public class GlobalExceptionHandler{
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<Object> handleException(ProductNotFoundException productNotFoundException){
        System.out.println("invoked");
        ExceptionDto exceptionDto=new ExceptionDto();
        exceptionDto.setHttpStatus(HttpStatus.NOT_FOUND);
        exceptionDto.setMessage("Product is not found");

        return new ResponseEntity<>(exceptionDto,HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException1(Exception e){
        System.out.println("invoked");
        ExceptionDto exceptionDto=new ExceptionDto();
        exceptionDto.setHttpStatus(HttpStatus.BAD_REQUEST);
        exceptionDto.setMessage("Invalid Request");

        return new ResponseEntity<>(exceptionDto,HttpStatus.BAD_REQUEST);
    }
}
