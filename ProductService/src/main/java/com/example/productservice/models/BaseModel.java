package com.example.productservice.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@AllArgsConstructor
@NoArgsConstructor
public class BaseModel implements Serializable {
    @Id
    @GeneratedValue(generator = "generator_name")
    @GenericGenerator(name="generator_name",strategy = "uuid2")
    @Column(name="id",columnDefinition ="binary(16)",nullable = false,updatable = false)

    private UUID id;
}
