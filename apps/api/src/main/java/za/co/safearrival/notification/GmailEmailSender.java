package za.co.safearrival.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class GmailEmailSender {
    private final JavaMailSender mailSender;
    private final String fromAddress;

    public GmailEmailSender(JavaMailSender mailSender, @Value("${app.email-from:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendOverdueNotice(String recipient, String contactLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject("SafeArrival: a journey check-in is overdue");
        message.setText("A SafeArrival journey check-in is overdue. This does not confirm that an emergency has happened.\n\n" +
            "Open the private contact notice: " + contactLink + "\n\n" +
            "If you believe someone is in immediate danger, contact local emergency services directly. SafeArrival does not dispatch responders.\n\n" +
            "This message was sent because the traveller selected this email for an overdue check-in.");
        mailSender.send(message);
    }
}
