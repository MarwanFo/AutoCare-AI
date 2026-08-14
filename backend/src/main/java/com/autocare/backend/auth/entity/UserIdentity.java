package com.autocare.backend.auth.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
    name = "user_identities",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_identities_provider_user_id", columnNames = {"provider", "provider_user_id"}),
        @UniqueConstraint(name = "uq_user_identities_user_provider", columnNames = {"user_id", "provider"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class UserIdentity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Provider is required")
    @Size(max = 50, message = "Provider name cannot exceed 50 characters")
    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    @NotBlank(message = "Provider user ID (sub) is required")
    @Size(max = 255, message = "Provider user ID cannot exceed 255 characters")
    @Column(name = "provider_user_id", nullable = false, length = 255)
    private String providerUserId;

    @Size(max = 255, message = "Provider email cannot exceed 255 characters")
    @Column(name = "provider_email", length = 255)
    private String providerEmail;
}
