package za.co.safearrival.journey;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class JourneyController {
    private final JourneyService journeys;

    public JourneyController(JourneyService journeys) {
        this.journeys = journeys;
    }

    @GetMapping("/demo/contacts")
    public List<DemoContact> contacts() {
        return journeys.listContacts();
    }

    @PostMapping("/journeys")
    public JourneyView start(@Valid @RequestBody StartJourneyRequest request) {
        if (!request.consent().contactMayBeNotifiedIfOverdue()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CONSENT_REQUIRED");
        }
        return journeys.start(request);
    }

    @GetMapping("/journeys/{id}")
    public JourneyView get(@PathVariable UUID id, @RequestHeader("Authorization") String authorization) {
        return journeys.get(id, bearerToken(authorization));
    }

    @PostMapping("/journeys/{id}/check-in")
    public JourneyView checkIn(@PathVariable UUID id, @RequestHeader("Authorization") String authorization) {
        return journeys.transition(id, bearerToken(authorization), JourneyService.Action.CHECK_IN, null);
    }

    @PostMapping("/journeys/{id}/cancel")
    public JourneyView cancel(@PathVariable UUID id, @RequestHeader("Authorization") String authorization) {
        return journeys.transition(id, bearerToken(authorization), JourneyService.Action.CANCEL, null);
    }

    @PostMapping("/journeys/{id}/extend")
    public JourneyView extend(
        @PathVariable UUID id,
        @RequestHeader("Authorization") String authorization,
        @Valid @RequestBody ExtendJourneyRequest request
    ) {
        return journeys.transition(id, bearerToken(authorization), JourneyService.Action.EXTEND, request.minutes());
    }

    @PostMapping("/journeys/{id}/demo/expire")
    public JourneyView simulateExpiry(@PathVariable UUID id, @RequestHeader("Authorization") String authorization) {
        return journeys.simulateExpiry(id, bearerToken(authorization));
    }

    @PostMapping("/journeys/{id}/location")
    public JourneyView shareLocation(
        @PathVariable UUID id,
        @RequestHeader("Authorization") String authorization,
        @Valid @RequestBody ShareLocationRequest request
    ) {
        if (!request.consent()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LOCATION_CONSENT_REQUIRED");
        return journeys.shareLocation(id, bearerToken(authorization), request);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/journeys/{id}/location")
    public JourneyView removeLocation(@PathVariable UUID id, @RequestHeader("Authorization") String authorization) {
        return journeys.removeLocation(id, bearerToken(authorization));
    }

    @GetMapping("/contact-alert")
    public ContactAlertView contactAlert(@RequestHeader("Authorization") String authorization) {
        return journeys.contactView(bearerToken(authorization));
    }

    @PostMapping("/contact-alert/acknowledge")
    public ContactAlertView acknowledge(@RequestHeader("Authorization") String authorization) {
        return journeys.acknowledge(bearerToken(authorization));
    }

    private static String bearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "INVALID_CAPABILITY");
        }
        return authorization.substring(7).trim();
    }

    public record DemoContact(String id, String name, String relation, String initials, String color) {}

    public record ConsentRequest(boolean contactMayBeNotifiedIfOverdue, boolean emailAlertConsent) {}

    public record StartJourneyRequest(
        @NotBlank @Size(max = 48) String destinationLabel,
        @Size(max = 40) String trustedContactId,
        @Size(max = 80) String trustedContactName,
        @Email @Size(max = 254) String contactEmail,
        @Min(5) @Max(90) int arrivalWindowMinutes,
        @NotNull ConsentRequest consent
    ) {}

    public record ExtendJourneyRequest(@Min(1) @Max(60) int minutes) {}

    public record ShareLocationRequest(double latitude, double longitude, int accuracyMeters, Instant capturedAt, boolean consent) {}

    public record JourneyView(
        UUID id,
        String destinationLabel,
        String contactName,
        String status,
        Instant startedAt,
        Instant deadlineAt,
        Instant serverNow,
        Instant overdueAt,
        String notificationStatus,
        String travellerToken,
        String contactToken,
        boolean locationShared,
        Instant locationCapturedAt,
        Integer locationAccuracyMeters
    ) {}

    public record ContactAlertView(
        String status,
        String destinationLabel,
        String contactName,
        Instant startedAt,
        Instant deadlineAt,
        Instant overdueAt,
        Instant acknowledgedAt,
        String notificationStatus,
        SharedLocation location
    ) {}

    public record SharedLocation(double latitude, double longitude, int accuracyMeters, Instant capturedAt) {}
}
