package com.example.productservice.controllers;
import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.exceptions.InvalidParameterException;
import com.example.productservice.exceptions.ProductNotFoundException;
import com.example.productservice.repositories.ProductRepository;
import com.example.productservice.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/products")

public class ProductController {
    //Constructor Injection
    private ProductService productService;
    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {

        this.productRepository = productRepository;
    }

    @Autowired
    public void setProductService (@Qualifier("selfProductServiceImpl") ProductService productService){
        this.productService=productService;
    }
    @GetMapping("/{id}")
        public GenericProductDto getProductById(@PathVariable("id") String id) throws ProductNotFoundException,
            InvalidParameterException {
        return productService.getProductById(id);
    }

    @GetMapping("")
    public List<GenericProductDto> getAllProducts(){
        return productService.getAllProducts();
    }
    @DeleteMapping("/{id}")
    public GenericProductDto deleteProductById(@PathVariable("id") String id) throws ProductNotFoundException {
        return productService.deleteProductById(id);
    }
    @PostMapping()
    public GenericProductDto createProduct(@RequestBody GenericProductDto genericProductDto){
        return productService.createProduct(genericProductDto);
    }
    @PatchMapping()
    public GenericProductDto updateProductById(@RequestBody GenericProductDto genericProductDto) throws ProductNotFoundException {
        return productService.updateProductById(genericProductDto);
    }

}
