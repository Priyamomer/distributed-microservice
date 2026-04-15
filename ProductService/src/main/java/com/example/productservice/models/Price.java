package com.example.productservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "price", uniqueConstraints = {@UniqueConstraint(columnNames = {"currency", "amount"})})
@AllArgsConstructor
@NoArgsConstructor
public class Price extends BaseModel implements Serializable {
    private String currency;
    private int amount;
}
