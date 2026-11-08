package za.co.safearrival.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class LiveModeGuard implements ApplicationRunner {
    private final String mode;
    private final String mailUsername;
    private final String mailPassword;
    private final String emailFrom;
    private final String baseUrl;
    private final String encryptionKey;
    private final String recipientAllowlist;

    public LiveModeGuard(
        @Value("${app.mode:demo}") String mode,
        @Value("${spring.mail.username:}") String mailUsername,
        @Value("${spring.mail.password:}") String mailPassword,
        @Value("${app.email-from:}") String emailFrom,
        @Value("${app.base-url:}") String baseUrl,
        @Value("${app.data-encryption-key:}") String encryptionKey,
        @Value("${app.email-allowlist:}") String recipientAllowlist
    ) {
        this.mode = mode;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.emailFrom = emailFrom;
        this.baseUrl = baseUrl;
        this.encryptionKey = encryptionKey;
        this.recipientAllowlist = recipientAllowlist;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        if (!"live".equalsIgnoreCase(mode)) return;
        if (blank(mailUsername) || blank(mailPassword) || blank(emailFrom)) {
            throw new IllegalStateException("Live mode requires MAIL_USERNAME, MAIL_APP_PASSWORD, and EMAIL_FROM");
        }
        if (blank(encryptionKey)) {
            throw new IllegalStateException("Live mode requires DATA_ENCRYPTION_KEY");
        }
        if (blank(recipientAllowlist)) {
            throw new IllegalStateException("Live mode requires LIVE_EMAIL_RECIPIENTS to restrict this accountless demo to approved recipients");
        }
        boolean localDevelopmentUrl = baseUrl != null &&
            (baseUrl.startsWith("http://localhost:") || baseUrl.startsWith("http://127.0.0.1:"));
        if (baseUrl == null || (!baseUrl.startsWith("https://") && !localDevelopmentUrl)) {
            throw new IllegalStateException("Live mode requires APP_BASE_URL to use HTTPS (HTTP localhost is allowed for local development)");
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
