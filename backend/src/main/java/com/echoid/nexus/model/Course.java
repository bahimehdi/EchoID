package com.echoid.nexus.model;

import com.echoid.nexus.model.enums.LmsSource;
import com.echoid.nexus.model.enums.SchoolEnum;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnTransformer;

import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "school_enum")
    @ColumnTransformer(write = "?::school_enum")
    private SchoolEnum school;

    @Enumerated(EnumType.STRING)
    @Column(name = "lms_source", nullable = false, columnDefinition = "lms_source")
    @ColumnTransformer(write = "?::lms_source")
    private LmsSource lmsSource;
}
