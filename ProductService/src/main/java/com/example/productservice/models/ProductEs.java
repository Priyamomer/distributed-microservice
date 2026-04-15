package com.example.productservice.models;
import com.example.productservice.dtos.GenericProductDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Document(indexName = "productes")
public class ProductEs {
    private UUID id;
    private String title;
    private String description;
    private int amount;
    private String image;
    private String category_name;
    private String currency;

    public GenericProductDto toGenericProductDto(ProductEs productEs){
        GenericProductDto genericProductDto = new GenericProductDto();
        genericProductDto.setId(productEs.getId().toString());
        genericProductDto.setTitle(productEs.getTitle());
        genericProductDto.setPrice(productEs.getAmount() / 100);
        genericProductDto.setCategory(productEs.getCategory_name());
        genericProductDto.setDescription(productEs.getDescription());
        genericProductDto.setImage(productEs.getImage());
        genericProductDto.setCurrency(productEs.getCurrency());
        return genericProductDto;
    }
}
