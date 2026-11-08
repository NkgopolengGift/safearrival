package za.co.safearrival.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.co.safearrival.security.DataProtector;

@RestController
@RequestMapping("/api/v1/runtime")
public class RuntimeController {
    private final String mode;
    private final DataProtector dataProtector;

    public RuntimeController(@Value("${app.mode:demo}") String mode, DataProtector dataProtector) {
        this.mode = mode;
        this.dataProtector = dataProtector;
    }

    @GetMapping
    public RuntimeInfo get() {
        boolean live = "live".equalsIgnoreCase(mode);
        return new RuntimeInfo(live ? "live" : "demo", live, dataProtector.isConfigured());
    }

    public record RuntimeInfo(String mode, boolean emailNotificationsEnabled, boolean locationSharingEnabled) {}
}
