package com.example.productservice.thirdParyClients;

import com.example.productservice.dtos.FakeStoreProductDto;
import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.exceptions.ProductNotFoundException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Component
public class FakeStoreClient {
        private RestTemplateBuilder restTemplateBuilder;
        private String getProductUrl="https://fakestoreapi.com/products";
        FakeStoreClient(RestTemplateBuilder restTemplateBuilder){
            this.restTemplateBuilder=restTemplateBuilder;
        }


        public FakeStoreProductDto getProductById(Long id) throws ProductNotFoundException {
            RestTemplate restTemplate=restTemplateBuilder.build();
            ResponseEntity<FakeStoreProductDto> responseEntity=
                    restTemplate.getForEntity(getProductUrl+"/"+id, FakeStoreProductDto.class);
            if(responseEntity.getBody()==null){
                throw new ProductNotFoundException("Product with id :"+id+" doesn't exist.");
            }
            return responseEntity.getBody();
        }

        public List<FakeStoreProductDto> getAllProducts(){
            RestTemplate restTemplate=restTemplateBuilder.build();
            ResponseEntity<FakeStoreProductDto[]> responseEntity=restTemplate.getForEntity(getProductUrl,FakeStoreProductDto[].class);
            List<FakeStoreProductDto> fakeStoreProductDtos=List.of(responseEntity.getBody());
            return fakeStoreProductDtos;
        }
        public FakeStoreProductDto deleteProductById(String id){

            RestTemplate restTemplate=restTemplateBuilder.build();
            RequestCallback requestCallback=restTemplate.acceptHeaderRequestCallback(FakeStoreProductDto.class);
            ResponseExtractor<ResponseEntity<FakeStoreProductDto>> responseExtractor=
                    restTemplate.responseEntityExtractor(FakeStoreProductDto.class);
            ResponseEntity<FakeStoreProductDto> responseEntity=
                    restTemplate.execute(getProductUrl+"/"+id, HttpMethod.DELETE,requestCallback,responseExtractor,id);
            return responseEntity.getBody();
        }
        public FakeStoreProductDto createProduct(GenericProductDto genericProductDto){
            RestTemplate restTemplate=restTemplateBuilder.build();
            ResponseEntity<FakeStoreProductDto> responseEntity=
                    restTemplate.postForEntity(getProductUrl, genericProductDto, FakeStoreProductDto.class);
            return responseEntity.getBody();
        }
    }
