package com.example.productservice.controllers;

import com.example.productservice.dtos.GenericProductDto;
import com.example.productservice.dtos.SearchRequestDto;
import com.example.productservice.services.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/products/search")
public class SearchController {
    SearchService searchService;
    @Autowired
    SearchController(SearchService searchService){
        this.searchService=searchService;
    }
    @PostMapping("")
    Page<GenericProductDto> searchProducts(@RequestBody SearchRequestDto requestDto){
        System.out.println(requestDto.getSortParams().get(0).getSortParamName()+"-"+requestDto.getSortParams().get(0).getSortType());
        return searchService.searchProductUsingES(requestDto.getQuery(),
                requestDto.getPageNumber(), requestDto.getItemsPerPage(),
                requestDto.getSortParams());
    }
}
