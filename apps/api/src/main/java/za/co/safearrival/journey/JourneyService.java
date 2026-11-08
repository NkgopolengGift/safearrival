package za.co.safearrival.journey;

import static za.co.safearrival.journey.JourneyController.ContactAlertView;
import static za.co.safearrival.journey.JourneyController.DemoContact;
import static za.co.safearrival.journey.JourneyController.JourneyView;
import static za.co.safearrival.journey.JourneyController.StartJourneyRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JourneyService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final RowMapper<JourneyRow> JOURNEY_MAPPER = JourneyService::mapJourney;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final Clock clock;
    private final String appMode;

    public JourneyService(JdbcTemplate jdbc, TransactionTemplate transactions, Clock clock, @Value("${app.mode:demo}") String appMode) {
        this.jdbc = jdbc;
        this.transactions = transactions;
        this.clock = clock;
        this.appMode = appMode;
    }

    public List<DemoContact> listContacts() {
        return jdbc.query(
            "SELECT id, display_name, relationship, initials, color FROM demo_contact ORDER BY id",
            (rs, row) -> new DemoContact(rs.getString("id"), rs.getString("display_name"),
                rs.getString("relationship"), rs.getString("initials"), rs.getString("color"))
        );
    }

    @Transactional
    public JourneyView start(StartJourneyRequest request) {
        String destination = request.destinationLabel().trim();
        if (destination.isEmpty() || destination.length() > 48 || destination.chars().anyMatch(Character::isISOControl)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_DESTINATION");
        }
        DemoContact contact = jdbc.query(
            "SELECT id, display_name, relationship, initials, color FROM demo_contact WHERE id = ?",
            (rs, row) -> new DemoContact(rs.getString("id"), rs.getString("display_name"),
                rs.getString("relationship"), rs.getString("initials"), rs.getString("color")),
            request.trustedContactId()
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_CONTACT"));

        String travellerToken = newToken();
        String contactToken = newToken();
        UUID id = UUID.randomUUID();
        Instant startedAt = clock.instant();
        Instant deadlineAt = startedAt.plusSeconds(request.arrivalWindowMinutes() * 60L);
        Instant contactTokenExpiresAt = deadlineAt.plusSeconds(72 * 60 * 60L);
        jdbc.update(
            "INSERT INTO journey (id, destination_label, contact_id, contact_name, status, traveller_token_hash, contact_token_hash, contact_token_expires_at, started_at, deadline_at) " +
                "VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)",
            id, destination, contact.id(), contact.name(), hash(travellerToken), hash(contactToken),
            Timestamp.from(contactTokenExpiresAt), Timestamp.from(startedAt), Timestamp.from(deadlineAt)
        );
        addEvent(id, "STARTED", "TRAVELLER", "{}", startedAt);
        return new JourneyView(id, destination, contact.name(), "ACTIVE", startedAt, deadlineAt, clock.instant(), null,
            "NOT_SENT", travellerToken, contactToken);
    }

    public JourneyView get(UUID id, String token) {
        JourneyRow row = findTravellerJourney(id, token);
        return view(row, alertDeliveryStatus(id));
    }

    @Transactional
    public JourneyView simulateExpiry(UUID id, String token) {
        if (!"demo".equalsIgnoreCase(appMode)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NOT_FOUND");
        }
        JourneyRow row = findTravellerJourney(id, token);
        if (row.status.equals("OVERDUE")) return view(row, alertDeliveryStatus(id));
        if (!row.status.equals("ACTIVE")) throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_ACTIVE");
        Instant now = clock.instant();
        int changed = jdbc.update("UPDATE journey SET deadline_at = ?, version = version + 1 WHERE id = ? AND status = 'ACTIVE'", Timestamp.from(now), id);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_ACTIVE");
        addEvent(id, "DEMO_EXPIRY_TRIGGERED", "TRAVELLER", "{}", now);
        return view(findTravellerJourney(id, token), "NOT_SENT");
    }

    @Transactional
    public JourneyView transition(UUID id, String token, Action action, Integer extensionMinutes) {
        JourneyRow row = findTravellerJourney(id, token);
        Instant now = clock.instant();
        switch (action) {
            case CHECK_IN -> {
                if (!row.status.equals("ACTIVE") && !row.status.equals("OVERDUE")) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_CHECK_IN_ABLE");
                }
                int changed = jdbc.update("UPDATE journey SET status = 'COMPLETED', completed_at = ?, version = version + 1 WHERE id = ? AND status IN ('ACTIVE', 'OVERDUE')", Timestamp.from(now), id);
                if (changed == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_STATE_CHANGED");
                addEvent(id, "CHECKED_IN", "TRAVELLER", "{}", now);
            }
            case CANCEL -> {
                if (!row.status.equals("ACTIVE") && !row.status.equals("OVERDUE")) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_CANCELLABLE");
                }
                int changed = jdbc.update("UPDATE journey SET status = 'CANCELLED', cancelled_at = ?, version = version + 1 WHERE id = ? AND status IN ('ACTIVE', 'OVERDUE')", Timestamp.from(now), id);
                if (changed == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_STATE_CHANGED");
                addEvent(id, "CANCELLED", "TRAVELLER", "{}", now);
            }
            case EXTEND -> {
                if (!row.status.equals("ACTIVE")) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_ACTIVE");
                }
                if (extensionMinutes == null || extensionMinutes < 1 || extensionMinutes > 60) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_EXTENSION");
                }
                if (row.extensionMinutesTotal + extensionMinutes > 120) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EXTENSION_LIMIT_REACHED");
                }
                Instant nextDeadline = row.deadlineAt.isAfter(now)
                    ? row.deadlineAt.plusSeconds(extensionMinutes * 60L)
                    : now.plusSeconds(extensionMinutes * 60L);
                int changed = jdbc.update("UPDATE journey SET deadline_at = ?, extension_minutes_total = extension_minutes_total + ?, version = version + 1 WHERE id = ? AND status = 'ACTIVE' AND extension_minutes_total + ? <= 120", Timestamp.from(nextDeadline), extensionMinutes, id, extensionMinutes);
                if (changed == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "JOURNEY_NOT_ACTIVE");
                addEvent(id, "DEADLINE_EXTENDED", "TRAVELLER", "{\"minutes\":" + extensionMinutes + "}", now);
            }
        }
        return view(findTravellerJourney(id, token), alertDeliveryStatus(id));
    }

    public ContactAlertView contactView(String token) {
        String tokenHash = hash(token);
        JourneyRow row = jdbc.query(
            "SELECT " + JOURNEY_COLUMNS + " FROM journey WHERE contact_token_hash = ? AND contact_token_expires_at > ?",
            JOURNEY_MAPPER,
            tokenHash, Timestamp.from(clock.instant())
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ALERT_UNAVAILABLE"));
        Instant acknowledgedAt = jdbc.query(
            "SELECT acknowledged_at FROM contact_alert WHERE journey_id = ?",
            rs -> rs.next() && rs.getTimestamp(1) != null ? rs.getTimestamp(1).toInstant() : null,
            row.id
        );
        String delivery = row.status.equals("OVERDUE") || row.status.equals("COMPLETED") || row.status.equals("CANCELLED")
            ? (row.overdueAt == null ? "NOT_SENT" : "SIMULATED")
            : "NOT_SENT";
        return new ContactAlertView(row.status, row.destinationLabel, row.contactName, row.startedAt, row.deadlineAt,
            row.overdueAt, acknowledgedAt, delivery);
    }

    @Transactional
    public ContactAlertView acknowledge(String token) {
        String tokenHash = hash(token);
        JourneyRow row = jdbc.query(
            "SELECT " + JOURNEY_COLUMNS + " FROM journey WHERE contact_token_hash = ? AND contact_token_expires_at > ?",
            JOURNEY_MAPPER,
            tokenHash, Timestamp.from(clock.instant())
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ALERT_UNAVAILABLE"));
        Instant now = clock.instant();
        int updated = jdbc.update("UPDATE contact_alert SET acknowledged_at = ? WHERE journey_id = ? AND acknowledged_at IS NULL", Timestamp.from(now), row.id);
        if (updated == 1) {
            addEvent(row.id, "CONTACT_ACKNOWLEDGED", "CONTACT", "{}", now);
        } else {
            Integer existing = jdbc.query("SELECT 1 FROM contact_alert WHERE journey_id = ?", rs -> rs.next() ? 1 : null, row.id);
            if (existing == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "ALERT_NOT_READY");
        }
        return contactView(token);
    }

    @Scheduled(fixedDelayString = "${app.expiry-poll-ms:1000}")
    public void expireDueJourneys() {
        List<UUID> due = jdbc.query(
            "SELECT id FROM journey WHERE status = 'ACTIVE' AND deadline_at <= ? ORDER BY deadline_at LIMIT 100",
            (rs, row) -> rs.getObject("id", UUID.class), Timestamp.from(clock.instant())
        );
        for (UUID id : due) {
            transactions.executeWithoutResult(status -> expireOne(id));
        }
    }

    @Scheduled(cron = "0 15 3 * * *", zone = "UTC")
    public void purgeOldDemoJourneys() {
        Instant cutoff = clock.instant().minusSeconds(7 * 24 * 60 * 60L);
        jdbc.update(
            "DELETE FROM journey WHERE (status = 'COMPLETED' AND completed_at < ?) " +
                "OR (status = 'CANCELLED' AND cancelled_at < ?) " +
                "OR (status = 'OVERDUE' AND overdue_at < ?) " +
                "OR (status = 'ACTIVE' AND deadline_at < ?)",
            Timestamp.from(cutoff), Timestamp.from(cutoff), Timestamp.from(cutoff), Timestamp.from(cutoff)
        );
    }

    private void expireOne(UUID id) {
        Instant now = clock.instant();
        int changed = jdbc.update(
            "UPDATE journey SET status = 'OVERDUE', overdue_at = ?, version = version + 1 WHERE id = ? AND status = 'ACTIVE' AND deadline_at <= ?",
            Timestamp.from(now), id, Timestamp.from(now)
        );
        if (changed == 0) return;
        JourneyRow row = jdbc.query("SELECT " + JOURNEY_COLUMNS + " FROM journey WHERE id = ?", JOURNEY_MAPPER, id).getFirst();
        UUID alertId = UUID.randomUUID();
        UUID outboxId = UUID.randomUUID();
        jdbc.update("INSERT INTO contact_alert (id, journey_id, token_hash, created_at) VALUES (?, ?, ?, ?)",
            alertId, id, row.contactTokenHash, Timestamp.from(now));
        jdbc.update("INSERT INTO notification_outbox (id, alert_id, status, idempotency_key, created_at, completed_at) VALUES (?, ?, 'SIMULATED', ?, ?, ?)",
            outboxId, alertId, "demo-" + alertId, Timestamp.from(now), Timestamp.from(now));
        jdbc.update("INSERT INTO notification_attempt (id, outbox_id, channel, outcome, attempt_number, attempted_at) VALUES (?, ?, 'IN_APP', 'SIMULATED', 1, ?)",
            UUID.randomUUID(), outboxId, Timestamp.from(now));
        addEvent(id, "OVERDUE", "SYSTEM", "{}", now);
    }

    private JourneyRow findTravellerJourney(UUID id, String token) {
        if (token == null || token.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "INVALID_CAPABILITY");
        return jdbc.query(
            "SELECT " + JOURNEY_COLUMNS + " FROM journey WHERE id = ? AND traveller_token_hash = ?",
            JOURNEY_MAPPER, id, hash(token)
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "JOURNEY_UNAVAILABLE"));
    }

    private String alertDeliveryStatus(UUID journeyId) {
        return jdbc.query(
            "SELECT o.status FROM notification_outbox o JOIN contact_alert a ON a.id = o.alert_id WHERE a.journey_id = ?",
            rs -> rs.next() ? rs.getString(1) : "NOT_SENT", journeyId
        );
    }

    private JourneyView view(JourneyRow row, String notificationStatus) {
        return new JourneyView(row.id, row.destinationLabel, row.contactName, row.status, row.startedAt,
            row.deadlineAt, clock.instant(), row.overdueAt, notificationStatus, null, null);
    }

    private void addEvent(UUID journeyId, String type, String actor, String metadata, Instant occurredAt) {
        jdbc.update("INSERT INTO journey_event (journey_id, event_type, actor_type, safe_metadata, occurred_at) VALUES (?, ?, ?, ?::jsonb, ?)",
            journeyId, type, actor, metadata, Timestamp.from(occurredAt));
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static JourneyRow mapJourney(ResultSet rs, int rowNumber) throws SQLException {
        return new JourneyRow(
            rs.getObject("id", UUID.class), rs.getString("destination_label"), rs.getString("contact_name"),
            rs.getString("status"), rs.getTimestamp("started_at").toInstant(), rs.getTimestamp("deadline_at").toInstant(),
            instantOrNull(rs, "overdue_at"), rs.getString("contact_token_hash"), rs.getInt("extension_minutes_total")
        );
    }

    private static Instant instantOrNull(ResultSet rs, String column) throws SQLException {
        Timestamp value = rs.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }

    private static final String JOURNEY_COLUMNS = "id, destination_label, contact_name, status, started_at, deadline_at, overdue_at, contact_token_hash, extension_minutes_total";

    private record JourneyRow(UUID id, String destinationLabel, String contactName, String status,
                              Instant startedAt, Instant deadlineAt, Instant overdueAt, String contactTokenHash,
                              int extensionMinutesTotal) {}

    enum Action { CHECK_IN, CANCEL, EXTEND }
}
