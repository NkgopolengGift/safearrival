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
import za.co.safearrival.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CookieValue;
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
    private final AuthService auth;

    public JourneyController(JourneyService journeys, AuthService auth) {
        this.journeys = journeys;
        this.auth = auth;
    }

    @GetMapping("/demo/contacts")
    public List<DemoContact> contacts() {
        return journeys.listContacts();
    }

    @PostMapping("/journeys")
    public JourneyView start(@Valid @RequestBody StartJourneyRequest request,
                             @CookieValue(name = "safe_arrival_session", required = false) String session) {
        if (!request.consent().contactMayBeNotifiedIfOverdue()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CONSENT_REQUIRED");
        }
        return journeys.start(request, auth.userIdOrNull(session));
    }

    @GetMapping("/journeys")
    public List<JourneyView> list(@CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.listOwned(auth.userIdOrNull(session));
    }

    @GetMapping("/journeys/{id}")
    public JourneyView get(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String authorization,
                           @CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.get(id, optionalBearerToken(authorization), auth.userIdOrNull(session));
    }

    @PostMapping("/journeys/{id}/check-in")
    public JourneyView checkIn(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String authorization,
                               @CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.transition(id, optionalBearerToken(authorization), JourneyService.Action.CHECK_IN, null, auth.userIdOrNull(session));
    }

    @PostMapping("/journeys/{id}/cancel")
    public JourneyView cancel(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String authorization,
                              @CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.transition(id, optionalBearerToken(authorization), JourneyService.Action.CANCEL, null, auth.userIdOrNull(session));
    }

    @PostMapping("/journeys/{id}/extend")
    public JourneyView extend(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @Valid @RequestBody ExtendJourneyRequest request,
        @CookieValue(name = "safe_arrival_session", required = false) String session
    ) {
        return journeys.transition(id, optionalBearerToken(authorization), JourneyService.Action.EXTEND, request.minutes(), auth.userIdOrNull(session));
    }

    @PostMapping("/journeys/{id}/demo/expire")
    public JourneyView simulateExpiry(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String authorization,
                                       @CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.simulateExpiry(id, optionalBearerToken(authorization), auth.userIdOrNull(session));
    }

    @PostMapping("/journeys/{id}/location")
    public JourneyView shareLocation(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @Valid @RequestBody ShareLocationRequest request,
        @CookieValue(name = "safe_arrival_session", required = false) String session
    ) {
        if (!request.consent()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LOCATION_CONSENT_REQUIRED");
        return journeys.shareLocation(id, optionalBearerToken(authorization), request, auth.userIdOrNull(session));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/journeys/{id}/location")
    public JourneyView removeLocation(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String authorization,
                                       @CookieValue(name = "safe_arrival_session", required = false) String session) {
        return journeys.removeLocation(id, optionalBearerToken(authorization), auth.userIdOrNull(session));
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

    private static String optionalBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) return null;
        return bearerToken(authorization);
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
