package za.co.safearrival.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long SESSION_DAYS = 30;
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(12);

    public AuthService(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public AuthResult register(String displayName, String email, String password) {
        String name = displayName == null ? "" : displayName.trim();
        String normalized = normalize(email);
        if (name.length() < 2 || name.length() > 80 || name.chars().anyMatch(Character::isISOControl)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a name between 2 and 80 characters.");
        }
        if (normalized.length() > 254 || !normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }
        if (password == null || password.length() < 12 || password.length() > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a password between 12 and 72 characters.");
        }
        UUID userId = UUID.randomUUID();
        try {
            jdbc.update("INSERT INTO account_user (id, email, email_normalized, display_name, password_hash) VALUES (?, ?, ?, ?, ?)",
                userId, email.trim(), normalized, name, passwords.encode(password));
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        return createSession(userId, normalized, name, false);
    }

    @Transactional
    public AuthResult login(String email, String password) {
        String normalized = normalize(email);
        AccountRow account = jdbc.query("SELECT id, email, display_name, password_hash, timezone, default_arrival_window_minutes, onboarding_completed_at IS NOT NULL AS onboarded FROM account_user WHERE email_normalized = ?",
            (rs, row) -> new AccountRow(rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("display_name"), rs.getString("password_hash"), rs.getBoolean("onboarded"), rs.getString("timezone"), rs.getInt("default_arrival_window_minutes")), normalized)
            .stream().findFirst().orElse(null);
        if (account == null || password == null || !passwords.matches(password, account.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }
        return createSession(account.id(), account.email(), account.displayName(), account.onboarded(), account.timezone(), account.defaultArrivalWindowMinutes());
    }

    public AccountView currentAccount(String token) {
        if (token == null || token.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue.");
        return jdbc.query("SELECT u.id, u.email, u.display_name, u.timezone, u.default_arrival_window_minutes, u.onboarding_completed_at IS NOT NULL AS onboarded " +
                "FROM auth_session s JOIN account_user u ON u.id = s.user_id " +
                "WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?",
            (rs, row) -> new AccountView(rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("display_name"), rs.getBoolean("onboarded"), rs.getString("timezone"), rs.getInt("default_arrival_window_minutes")),
            hash(token), java.sql.Timestamp.from(clock.instant())).stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session has expired. Sign in again."));
    }

    public UUID userIdOrNull(String token) {
        if (token == null || token.isBlank()) return null;
        return jdbc.query("SELECT user_id FROM auth_session WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?",
            (rs, row) -> rs.getObject("user_id", UUID.class), hash(token), java.sql.Timestamp.from(clock.instant()))
            .stream().findFirst().orElse(null);
    }

    @Transactional
    public void revoke(String token) {
        if (token == null || token.isBlank()) return;
        jdbc.update("UPDATE auth_session SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
            java.sql.Timestamp.from(clock.instant()), hash(token));
    }

    @Transactional
    public AccountView completeOnboarding(String token, String timezone, int defaultArrivalWindowMinutes) {
        AccountView account = currentAccount(token);
        String selectedTimezone = timezone == null ? "" : timezone.trim();
        try { java.time.ZoneId.of(selectedTimezone); }
        catch (RuntimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid time zone."); }
        if (defaultArrivalWindowMinutes < 5 || defaultArrivalWindowMinutes > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The default arrival window must be between 5 and 120 minutes.");
        }
        jdbc.update("UPDATE account_user SET timezone = ?, default_arrival_window_minutes = ?, onboarding_completed_at = COALESCE(onboarding_completed_at, ?), updated_at = ? WHERE id = ?",
            selectedTimezone, defaultArrivalWindowMinutes, java.sql.Timestamp.from(clock.instant()), java.sql.Timestamp.from(clock.instant()), account.id());
        return new AccountView(account.id(), account.email(), account.displayName(), true, selectedTimezone, defaultArrivalWindowMinutes);
    }

    private AuthResult createSession(UUID userId, String email, String displayName, boolean onboarded) {
        return createSession(userId, email, displayName, onboarded, "Africa/Johannesburg", 20);
    }

    private AuthResult createSession(UUID userId, String email, String displayName, boolean onboarded, String timezone, int defaultWindow) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant now = clock.instant();
        jdbc.update("INSERT INTO auth_session (id, user_id, token_hash, created_at, expires_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)",
            UUID.randomUUID(), userId, hash(token), java.sql.Timestamp.from(now), java.sql.Timestamp.from(now.plusSeconds(SESSION_DAYS * 86400)), java.sql.Timestamp.from(now));
        return new AuthResult(token, new AccountView(userId, email, displayName, onboarded, timezone, defaultWindow));
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private record AccountRow(UUID id, String email, String displayName, String passwordHash, boolean onboarded, String timezone, int defaultArrivalWindowMinutes) {}
    public record AccountView(UUID id, String email, String displayName, boolean onboardingComplete, String timezone, int defaultArrivalWindowMinutes) {}
    public record AuthResult(String token, AccountView account) {}
}
