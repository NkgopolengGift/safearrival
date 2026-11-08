package za.co.safearrival.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final String COOKIE_NAME = "safe_arrival_session";
    private final AuthService auth;
    private final boolean secureCookie;

    public AuthController(AuthService auth, @Value("${app.auth-cookie-secure:false}") boolean secureCookie) {
        this.auth = auth;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthService.AccountView> register(@RequestBody RegisterRequest request) {
        AuthService.AuthResult result = auth.register(request.displayName(), request.email(), request.password());
        return withSession(result);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthService.AccountView> login(@RequestBody LoginRequest request) {
        return withSession(auth.login(request.email(), request.password()));
    }

    @GetMapping("/me")
    public AuthService.AccountView me(@CookieValue(name = COOKIE_NAME, required = false) String session) {
        return auth.currentAccount(session);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = COOKIE_NAME, required = false) String session) {
        auth.revoke(session);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", 0).toString()).build();
    }

    @PostMapping("/onboarding")
    public AuthService.AccountView completeOnboarding(
        @CookieValue(name = COOKIE_NAME, required = false) String session,
        @RequestBody OnboardingRequest request
    ) {
        return auth.completeOnboarding(session, request.timezone(), request.defaultArrivalWindowMinutes());
    }

    private ResponseEntity<AuthService.AccountView> withSession(AuthService.AuthResult result) {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie(result.token(), 30L * 24 * 60 * 60).toString()).body(result.account());
    }

    private ResponseCookie cookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(COOKIE_NAME, value).httpOnly(true).secure(secureCookie).sameSite("Strict")
            .path("/api/v1").maxAge(maxAgeSeconds).build();
    }

    public record RegisterRequest(String displayName, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record OnboardingRequest(String timezone, int defaultArrivalWindowMinutes) {}
}
