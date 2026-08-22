package com.spendly.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "category")
public class Category extends TenantScopedEntity {

    @Column(nullable = false)
    private String name;

    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryType type;
}