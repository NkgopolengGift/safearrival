package za.co.safearrival.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import za.co.safearrival.security.DataProtector;

@Component
public class NotificationOutboxWorker {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final Clock clock;
    private final DataProtector dataProtector;
    private final ObjectMapper objectMapper;
    private final GmailEmailSender emailSender;
    private final String appMode;

    public NotificationOutboxWorker(
        JdbcTemplate jdbc,
        TransactionTemplate transactions,
        Clock clock,
        DataProtector dataProtector,
        ObjectMapper objectMapper,
        GmailEmailSender emailSender,
        @Value("${app.mode:demo}") String appMode
    ) {
        this.jdbc = jdbc;
        this.transactions = transactions;
        this.clock = clock;
        this.dataProtector = dataProtector;
        this.objectMapper = objectMapper;
        this.emailSender = emailSender;
        this.appMode = appMode;
    }

    @Scheduled(fixedDelay = 2000)
    public void processOne() {
        if (!"live".equalsIgnoreCase(appMode)) return;
        markAbandonedSendUnknown();
        OutboxItem item = claimOne();
        if (item == null) return;

        try {
            EmailPayload payload = objectMapper.readValue(dataProtector.decrypt(item.payloadCiphertext), EmailPayload.class);
            emailSender.sendOverdueNotice(payload.recipient(), payload.contactLink());
            recordOutcome(item, "SENT", "ACCEPTED", null);
        } catch (MailAuthenticationException exception) {
            recordOutcome(item, "FAILED", "REJECTED", "SMTP_AUTH_REJECTED");
        } catch (MailException exception) {
            recordOutcome(item, "UNKNOWN", "UNKNOWN", "SMTP_SEND_UNCERTAIN");
        } catch (Exception exception) {
            recordOutcome(item, "UNKNOWN", "UNKNOWN", "EMAIL_PROCESSING_ERROR");
        }
    }

    private OutboxItem claimOne() {
        return transactions.execute(status -> {
            Instant now = clock.instant();
            List<OutboxItem> items = jdbc.query(
                "SELECT id, alert_id, payload_ciphertext, attempt_count FROM notification_outbox " +
                    "WHERE status = 'QUEUED' AND available_at <= ? ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED",
                (rs, row) -> new OutboxItem(rs.getObject("id", UUID.class), rs.getObject("alert_id", UUID.class),
                    rs.getString("payload_ciphertext"), rs.getInt("attempt_count") + 1), Timestamp.from(now)
            );
            if (items.isEmpty()) return null;
            OutboxItem item = items.getFirst();
            jdbc.update("UPDATE notification_outbox SET status = 'SENDING', attempt_count = ?, lease_until = ? WHERE id = ?",
                item.attemptNumber(), Timestamp.from(now.plusSeconds(60)), item.id());
            return item;
        });
    }

    private void recordOutcome(OutboxItem item, String outboxStatus, String outcome, String failureCode) {
        transactions.executeWithoutResult(status -> {
            Instant now = clock.instant();
            int updated = jdbc.update("UPDATE notification_outbox SET status = ?, payload_ciphertext = NULL, lease_until = NULL, completed_at = ? WHERE id = ? AND status = 'SENDING'",
                outboxStatus, Timestamp.from(now), item.id());
            if (updated == 0) return;
            jdbc.update("INSERT INTO notification_attempt (id, outbox_id, channel, outcome, attempt_number, failure_code, attempted_at) VALUES (?, ?, 'EMAIL', ?, ?, ?, ?)",
                UUID.randomUUID(), item.id(), outcome, item.attemptNumber(), failureCode, Timestamp.from(now));
            jdbc.update("UPDATE journey SET contact_email_ciphertext = NULL WHERE id = (SELECT journey_id FROM contact_alert WHERE id = ?)", item.alertId());
        });
    }

    private void markAbandonedSendUnknown() {
        transactions.executeWithoutResult(status -> {
            Instant now = clock.instant();
            List<OutboxItem> abandoned = jdbc.query(
                "SELECT id, alert_id, payload_ciphertext, attempt_count FROM notification_outbox WHERE status = 'SENDING' AND lease_until < ? FOR UPDATE SKIP LOCKED",
                (rs, row) -> new OutboxItem(rs.getObject("id", UUID.class), rs.getObject("alert_id", UUID.class),
                    rs.getString("payload_ciphertext"), rs.getInt("attempt_count")), Timestamp.from(now)
            );
            for (OutboxItem item : abandoned) {
                jdbc.update("UPDATE notification_outbox SET status = 'UNKNOWN', payload_ciphertext = NULL, lease_until = NULL, completed_at = ? WHERE id = ?",
                    Timestamp.from(now), item.id());
                jdbc.update("INSERT INTO notification_attempt (id, outbox_id, channel, outcome, attempt_number, failure_code, attempted_at) VALUES (?, ?, 'EMAIL', 'UNKNOWN', ?, 'WORKER_LOST_DURING_SEND', ?)",
                    UUID.randomUUID(), item.id(), item.attemptNumber(), Timestamp.from(now));
                jdbc.update("UPDATE journey SET contact_email_ciphertext = NULL WHERE id = (SELECT journey_id FROM contact_alert WHERE id = ?)", item.alertId());
            }
        });
    }

    private record OutboxItem(UUID id, UUID alertId, String payloadCiphertext, int attemptNumber) {}
    private record EmailPayload(String recipient, String contactLink) {}
}
