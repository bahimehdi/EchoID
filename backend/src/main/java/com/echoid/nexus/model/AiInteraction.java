package com.echoid.nexus.model;

import com.echoid.nexus.model.enums.ExplanationLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_interactions")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "course", "document"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(name = "concept_queried", nullable = false)
    private String conceptQueried;

    @Enumerated(EnumType.STRING)
    @Column(name = "explanation_level", nullable = false)
    private ExplanationLevel explanationLevel;

    @Column(name = "explanation_given", nullable = false)
    private String explanationGiven;

    @Column(name = "helpful_rating")
    private Short helpfulRating;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
