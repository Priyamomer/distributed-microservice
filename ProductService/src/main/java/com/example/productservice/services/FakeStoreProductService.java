package com.example.productservice.services;

import com.example.productservice.dtos.FakeStoreProductDto;
import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.exceptions.ProductNotFoundException;
import com.example.productservice.thirdParyClients.FakeStoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("fakeStoreProductServiceImpl")
public class FakeStoreProductService implements ProductService{
    private FakeStoreClient fakeStoreAdapter;
    FakeStoreProductService(FakeStoreClient fakeStoreAdapter){
        this.fakeStoreAdapter=fakeStoreAdapter;
    }

    private static GenericProductDto convertToGenericProductDto (FakeStoreProductDto fakeStoreProductDto){
        GenericProductDto genericProductDto = new GenericProductDto();
        genericProductDto.setId(fakeStoreProductDto.getId());
        genericProductDto.setImage(fakeStoreProductDto.getImage());
        genericProductDto.setCategory(fakeStoreProductDto.getCategory());
        genericProductDto.setDescription(fakeStoreProductDto.getDescription());
        genericProductDto.setTitle(fakeStoreProductDto.getTitle());
        genericProductDto.setPrice(fakeStoreProductDto.getPrice());
        return genericProductDto;
    }

    public GenericProductDto getProductById(String id) throws ProductNotFoundException {
        return convertToGenericProductDto(fakeStoreAdapter.getProductById(Long.parseLong(id)));
    }


    public List<GenericProductDto> getAllProducts(){
        List<FakeStoreProductDto> fakeStoreProductDtos=fakeStoreAdapter.getAllProducts();
        List<GenericProductDto> result=new ArrayList<>();
        for(FakeStoreProductDto fakeStoreProductDto:fakeStoreProductDtos){
            result.add(convertToGenericProductDto(fakeStoreProductDto));
        }
        return result;
    }
    public GenericProductDto deleteProductById(String id){
        return convertToGenericProductDto(fakeStoreAdapter.deleteProductById(id));
    }
    public GenericProductDto createProduct(GenericProductDto genericProductDto){
        return convertToGenericProductDto(fakeStoreAdapter.createProduct(genericProductDto));
    }
    public GenericProductDto updateProductById(GenericProductDto genericProductDto){
    return null;
    }
}
