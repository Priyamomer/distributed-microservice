package com.example.productservice.repositories;

import com.example.productservice.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>{

    @Modifying
    @Query("update Product p set p.description = :description where p.id = :id")
    void changeDescription(@Param("description") String description, @Param("id") UUID id);



    @Override
    Optional<Product> findById(UUID uuid);

    List<Product> findAll();

    @Override
    <S extends Product> S save(S entity);

    Page<Product> findAllByTitleContainingIgnoreCase(String title, Pageable pageable);



    //    @Override
//    //<S extends Product> S save(S entity);
//    List<Product> findAll();
//    List<Product> findAllByTitle(String title);
//    List<Product> findAllByTitleAndDescription(String title,String desc);
//    @Override
//    <S extends Product> List<S> findAll(Example<S> example);
//
//    //<S extends Product> this is generic type declaration, It's stating that the method is
//    //Generic and can work with any type of 'S' that extends or is subtype of 'Product'
//    //List<S> is specifying the return type
//    //findALL is the method name
//    //Example<S> this is a parameterized type representing an example instance of type 'S'
//    //The example is created using an instance of the entity with
//    // set properties, and the method generates a dynamic query to find
//    // entities whose non-null properties match the values in the example.
//
//    List<Product> findAllByPrice_ValueLessThan(Integer x);
//
//    //@Query(value = "select * from product where id = 1", nativeQuery = true)
//    List<Product> findAllByPrice_ValueBetween(double x, double y);
//
//    List<Product> findAllByCategory_Name(String name);
}
