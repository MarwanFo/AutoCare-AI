package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.GoogleIdentity;

public interface GoogleIdentityVerifier {

    GoogleIdentity verify(String idTokenString);
}
