package com.example.productservice.services;

import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.exceptions.InvalidParameterException;
import com.example.productservice.exceptions.ProductNotFoundException;

import java.util.List;
import java.util.UUID;

public interface ProductService {
    //String getProductById(Long id);

    //GenericProductDto getProductById(String authToken,String id) throws ProductNotFoundException, InvalidParameterException;
    GenericProductDto getProductById(String id) throws ProductNotFoundException, InvalidParameterException;
    List<GenericProductDto> getAllProducts();
    GenericProductDto deleteProductById(String id) throws ProductNotFoundException;
    GenericProductDto createProduct(GenericProductDto genericProductDto);
    GenericProductDto updateProductById(GenericProductDto genericProductDto) throws ProductNotFoundException;

}
