package com.example.productservice.services;

import com.example.productservice.dtos.FakeStoreProductDto;
import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.exceptions.InvalidParameterException;
import com.example.productservice.exceptions.ProductNotFoundException;
import com.example.productservice.models.Category;
import com.example.productservice.models.Price;
import com.example.productservice.models.Product;
import com.example.productservice.models.ProductEs;
import com.example.productservice.repositories.CategoryRepository;
import com.example.productservice.repositories.PriceRepository;
import com.example.productservice.repositories.ProductRepository;
import com.example.productservice.repositories.ProductRepositoryES;
import com.example.productservice.security.JWTObject;
import com.example.productservice.security.SessionStatus;
import com.example.productservice.security.TokenValidator;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service("selfProductServiceImpl")
public class SelfProductServiceImplementation implements ProductService{

    private final ProductRepository productRepository;
    private final PriceRepository priceRepository;
    private final CategoryRepository categoryRepository;
    private final TokenValidator tokenValidator;
    private final RedisTemplate<String,Object> redisTemplate;
    private final ProductRepositoryES productRepositoryES;

    @Autowired
    SelfProductServiceImplementation(ProductRepository productRepository,
                                     PriceRepository priceRepository, CategoryRepository categoryRepository,
                                     TokenValidator tokenValidator, RedisTemplate redisTemplate,
                                     ProductRepositoryES productRepositoryES){
        this.productRepository=productRepository;
        this.priceRepository = priceRepository;
        this.categoryRepository=categoryRepository;
        this.tokenValidator = tokenValidator;
        this.redisTemplate=redisTemplate;
        this.productRepositoryES = productRepositoryES;
    }
    public Product genericProductDtoToProduct(GenericProductDto genericProductDto){
        Product product=new Product();
        Category category;
        Price price;
        Optional<Category> categoryOptional = categoryRepository.findByName(genericProductDto.getCategory());
        category = categoryOptional.orElseGet(() -> categoryRepository.save(new Category(genericProductDto.getCategory())));

        Optional<Price> priceOptional = priceRepository.findByAmountAndCurrency(genericProductDto.getPrice()*100,genericProductDto.getCurrency());
        price = priceOptional.orElseGet(() -> priceRepository.save(new Price(genericProductDto.getCurrency(),genericProductDto.getPrice()*100)));


        product.setTitle(genericProductDto.getTitle());
        product.setDescription(genericProductDto.getDescription());
        product.setPrice(price);
        product.setImage(genericProductDto.getImage());
        product.setCategory(category);

        return product;

    }
    public GenericProductDto getProductById(String id) throws ProductNotFoundException, InvalidParameterException {

        /* API LEVEL VALIDATION CODE
        SessionStatus sessionStatus=tokenValidator.validateToken(authToken);
        if(sessionStatus==SessionStatus.ENDED){
            throw new InvalidParameterException("Invalid auth Token");
        }
        JWTObject jWTObject = jwtObjectOptional.get();
        */
        Product productFromCache= (Product) redisTemplate.opsForHash().get("PRODUCTS",id);
        if(productFromCache != null){
            System.out.println("CACHE HAS BEEN INVOKED");
            System.out.println( productFromCache.getTitle());
            return productFromCache.toGenericProductDtos(productFromCache);
        }
        UUID uuid=UUID.fromString(id);
        Optional<Product> productOptional = productRepository.findById(uuid);
        if(productOptional.isEmpty()) {
            System.out.println("ERROR IS THROWN 1");
            throw new ProductNotFoundException("Product not found ");
        }
        Product product=productOptional.get();
        System.out.println("ERROR IS THROWN 2");
        redisTemplate.opsForHash().put("PRODUCTS",id,product);
        return product.toGenericProductDtos(product);
    }

    public List<GenericProductDto> getAllProducts(){

        List<Product>productList=productRepository.findAll();
        List<GenericProductDto> genericProductDtoList = new ArrayList<>();
        for (Product product:productList){
            genericProductDtoList.add(product.toGenericProductDtos(product));
        }
//        return genericProductDtoList;

//        List<ProductEs>productEsList=productRepository.findAll();
//        List<GenericProductDto> genericProductDtoList=new ArrayList<>();
//        for(ProductEs productEs:productEsList){
//            genericProductDtoList.add(productEs.toGenericProductDto(productEs));
//        }
        return genericProductDtoList;
    }
    public GenericProductDto deleteProductById(String id) throws ProductNotFoundException {
        UUID uuid=UUID.fromString(id);
        Optional<Product>productOptional= productRepository.findById(uuid);
        if(productOptional.isEmpty()) throw new ProductNotFoundException("Product not found while deleting the product");
        productRepository.deleteById(uuid);
        return productOptional.get().toGenericProductDtos(productOptional.get());
    }
    public GenericProductDto createProduct(GenericProductDto genericProductDto){
        Product product = productRepository.save(genericProductDtoToProduct(genericProductDto));
        ProductEs productEs = product.toProductEs(product);
        ProductEs productEs1=productRepositoryES.save(productEs);
        System.out.println("ProductES Price"+productEs1.getAmount());
        return product.toGenericProductDtos(product);
    }
    @Transactional
    public GenericProductDto updateProductById(GenericProductDto genericProductDto) throws ProductNotFoundException {
        Optional<Product> productOptional= productRepository.findById(UUID.fromString(genericProductDto.getId()));
        Product product;
        if(productOptional.isPresent()) product=productOptional.get();
        else throw new ProductNotFoundException("Update Request invalid as no such product is present");
        Product sample = genericProductDtoToProduct(genericProductDto);
        product.setTitle(sample.getTitle());
        product.setPrice(sample.getPrice());
        product.setCategory(sample.getCategory());
        product.setDescription(sample.getDescription());
        product.setImage(sample.getImage());
        productRepository.save(product);

        ProductEs productEs = product.toProductEs(product);
        productRepositoryES.save(productEs);

        redisTemplate.opsForHash().put("PRODUCTS", product.getId(), product);


        Product productFromCache = (Product) redisTemplate.opsForHash().get("PRODUCTS", genericProductDto.getId());
        if (productFromCache != null) {
            System.out.println("Updating product in cache");
            redisTemplate.opsForHash().put("PRODUCTS", genericProductDto.getId(), product);
        }
        return product.toGenericProductDtos(product);
    }
}
