package com.example.productservice.inheritencerelations.tableperclass;

import jakarta.persistence.Entity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity(name="tpc_student")
public class Student extends User {
    private double psp;

}
