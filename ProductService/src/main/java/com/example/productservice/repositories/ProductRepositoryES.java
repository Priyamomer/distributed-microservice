package com.example.productservice.repositories;

import com.example.productservice.models.Product;
import com.example.productservice.models.ProductEs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/* To query all the document of the index
http://localhost:9200/productes/_search?pretty=true&q=*:*&size=1000
 */
@Repository
public interface ProductRepositoryES extends ElasticsearchRepository<ProductEs, UUID> {
    ProductEs save(ProductEs productEs);
    List<ProductEs> findAll();
    Page<ProductEs> findAllByTitle(String title, Pageable pageable);
}
