package com.autocare.backend.auth.mapper;

import com.autocare.backend.auth.dto.SessionResponse;
import com.autocare.backend.auth.entity.UserSession;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface UserSessionMapper {

    @Mapping(target = "sessionId", source = "id")
    @Mapping(target = "isCurrent", expression = "java(session.getId() != null && session.getId().equals(currentSessionId))")
    SessionResponse toResponse(UserSession session, @Context UUID currentSessionId);

    List<SessionResponse> toResponseList(List<UserSession> sessions, @Context UUID currentSessionId);
}
