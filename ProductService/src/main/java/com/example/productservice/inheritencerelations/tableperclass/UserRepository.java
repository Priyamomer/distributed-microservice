package com.example.productservice.inheritencerelations.tableperclass;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository("tpcUserRepo")
public interface UserRepository extends JpaRepository <User,Long>{
    @Override
    <S extends User> S save (S entity);

}
