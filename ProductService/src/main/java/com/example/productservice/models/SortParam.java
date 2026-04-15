package com.example.productservice.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
public class SortParam {
    private String sortParamName;
    private String sortType;
}
