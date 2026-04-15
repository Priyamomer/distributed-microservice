package com.example.productservice.models;

import com.example.productservice.dtos.GenericProductDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor

public class Product extends BaseModel implements Serializable {

    private String title;
    private String description;
    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})  // Only allow saving and updating
    @JoinColumn
    private Price price;
    private String image;
    @ManyToOne
    private Category category;

    public GenericProductDto toGenericProductDtos(Product product) {
       GenericProductDto genericProductDto = new GenericProductDto();
       genericProductDto.setId(product.getId().toString());
       genericProductDto.setTitle(product.getTitle());
       genericProductDto.setPrice(product.price.getAmount() / 100);
       genericProductDto.setCategory(product.category.getName());
       genericProductDto.setDescription(product.getDescription());
       genericProductDto.setImage(product.getImage());
       genericProductDto.setCurrency(product.price.getCurrency());
       return genericProductDto;
    }
    public ProductEs toProductEs(Product product){
        ProductEs productEs =new ProductEs();
        productEs.setId(product.getId());
        productEs.setTitle(product.getTitle());
        productEs.setDescription(product.getDescription());
        productEs.setAmount(product.getPrice().getAmount());
        productEs.setCurrency(product.getPrice().getCurrency());
        productEs.setImage(product.getImage());
        productEs.setCategory_name(product.getCategory().getName());
        return productEs;
    }
}
