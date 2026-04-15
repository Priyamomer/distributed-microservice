package com.example.productservice;

import com.example.productservice.exceptions.AlreadyExistException;
import com.example.productservice.exceptions.ProductNotFoundException;
import com.example.productservice.models.UserDto;
import com.example.productservice.repositories.CategoryRepository;
import com.example.productservice.repositories.PriceRepository;
import com.example.productservice.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;


@SpringBootApplication
//@EnableJpaRepositories("com.example.productservice.repositories")
//@EnableElasticsearchRepositories("com.example.productservice.repositorieselasticsearch")
//@EnableJpaRepositories(excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = ElasticsearchRepository.class))
//@EnableElasticsearchRepositories(includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,value=ElasticsearchRepository.class))
public class ProductServiceApplication implements CommandLineRunner {

    private final ProductRepository productRepository;

    private final CategoryRepository categoryRepository;
    private final PriceRepository priceRepository;
    private final RedisTemplate<String,Object> redisTemplate;

    private final RestTemplate restTemplate;


    @Autowired
    ProductServiceApplication(ProductRepository productRepository, CategoryRepository categoryRepository,
                              PriceRepository priceRepository,
                              RedisTemplate redisTemplate, RestTemplate restTemplate){
        this.productRepository = productRepository;
        this.categoryRepository= categoryRepository;
        this.priceRepository = priceRepository;
        this.redisTemplate=redisTemplate;
        this.restTemplate = restTemplate;
    }

    public static void main(String[] args) {
       SpringApplication.run(ProductServiceApplication.class,args);
    }

    public void run(String... args) throws ProductNotFoundException, AlreadyExistException {
        //Price p=new Price("INT",100);
//        Optional<Product> productOptional = productRepository.findById(UUID.fromString("01087441-38f5-4bf7-a561-566331a12c55"));
//        if(productOptional.isEmpty()) throw  new ProductNotFoundException("NOT FOUND");
//        Product product=productOptional.get();
//        System.out.println("Product title is "+product.getTitle());
//        redisTemplate.opsForHash().put("PR","09bbbd5d-8fc1-4f0e-a94e-fe2e2651d4b9",product);
//        System.out.println("ID IS "+product.getId());
//        Product product1= (Product) redisTemplate.opsForHash().get("PR","09bbbd5d-8fc1-4f0e-a94e-fe2e2651d4b9");
//        System.out.println(product1.getTitle());
//        System.out.println("ID IS "+product1.getId());
//        //System.out.println(product1.toGenericProductDtos(product1).getTitle());
//        GenericProductDto genericProductDto=product1.toGenericProductDtos(product1);
//        System.out.println(genericProductDto.getTitle());


//        ResponseEntity<UserDto> userDtoResponseEntity = restTemplate.getForEntity
//                ("http://userservice/users/1", UserDto.class);

    }
}
