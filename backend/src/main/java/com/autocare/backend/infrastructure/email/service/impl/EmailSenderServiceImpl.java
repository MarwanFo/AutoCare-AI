package com.autocare.backend.infrastructure.email.service.impl;

import com.autocare.backend.infrastructure.email.service.EmailSenderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailSenderServiceImpl implements EmailSenderService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.auth.verification-base-url:http://localhost:8080/api/v1/auth/verify-email}")
    private String verificationBaseUrl;

    public EmailSenderServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    @Override
    public void sendVerificationEmail(String recipientEmail, String rawToken) {
        String verificationUrl = verificationBaseUrl + "?token=" + rawToken;

        log.info("\n========================================================================================" +
                "\n[EMAIL VERIFICATION DISPATCH] ✉️" +
                "\nRecipient: {}" +
                "\nVerification Token: {}" +
                "\nDirect Verification Link: {}" +
                "\n========================================================================================",
                recipientEmail, rawToken, verificationUrl);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailUsername);
                message.setTo(recipientEmail);
                message.setSubject("AutoCare AI — Verify Your Email Address");
                message.setText(
                        "Welcome to AutoCare AI!\n\n" +
                        "Please verify your email address to complete your registration:\n\n" +
                        "Verification Link: " + verificationUrl + "\n" +
                        "Verification Code: " + rawToken + "\n\n" +
                        "This token is valid for 24 hours.\n\n" +
                        "If you did not register for an AutoCare AI account, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "AutoCare AI Engineering Team"
                );

                mailSender.send(message);
                log.info("Successfully dispatched verification SMTP email to {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to transmit SMTP email to {}. Fall back to console token link.", recipientEmail, e);
            }
        } else {
            log.warn("SMTP Mail Username is unconfigured. Email logged to console above.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawToken) {
        log.info("\n========================================================================================" +
                "\n[PASSWORD RESET EMAIL DISPATCH] 🔑" +
                "\nRecipient: {}" +
                "\nReset Token: {}" +
                "\n========================================================================================",
                recipientEmail, rawToken);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailUsername);
                message.setTo(recipientEmail);
                message.setSubject("AutoCare AI — Reset Your Password");
                message.setText(
                        "Hello,\n\n" +
                        "You requested a password reset for your AutoCare AI account.\n\n" +
                        "Password Reset Token: " + rawToken + "\n\n" +
                        "This token is valid for 15 minutes.\n\n" +
                        "Best regards,\n" +
                        "AutoCare AI Engineering Team"
                );

                mailSender.send(message);
                log.info("Successfully dispatched password reset SMTP email to {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to transmit password reset SMTP email to {}", recipientEmail, e);
            }
        }
    }
}
