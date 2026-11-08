package za.co.safearrival.security;

import jakarta.annotation.PostConstruct;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DataProtector {
    private static final int NONCE_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;
    private static final SecureRandom RANDOM = new SecureRandom();
    private final String encodedKey;

    public DataProtector(@Value("${app.data-encryption-key:}") String encodedKey) {
        this.encodedKey = encodedKey == null ? "" : encodedKey.trim();
    }

    @PostConstruct
    void validateKey() {
        if (encodedKey.isEmpty()) return;
        if (keyBytes().length != 32) {
            throw new IllegalStateException("DATA_ENCRYPTION_KEY must be base64-encoded 32-byte key material");
        }
    }

    public boolean isConfigured() {
        return !encodedKey.isEmpty();
    }

    public String encrypt(String value) {
        if (!isConfigured()) throw new IllegalStateException("Encrypted data storage is not configured");
        try {
            byte[] nonce = new byte[NONCE_LENGTH];
            RANDOM.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes(), "AES"), new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
            byte[] ciphertext = cipher.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(nonce.length + ciphertext.length).put(nonce).put(ciphertext).array());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not protect sensitive data", exception);
        }
    }

    public String decrypt(String value) {
        if (!isConfigured()) throw new IllegalStateException("Encrypted data storage is not configured");
        try {
            byte[] packed = Base64.getDecoder().decode(value);
            if (packed.length <= NONCE_LENGTH) throw new IllegalArgumentException("Invalid protected value");
            ByteBuffer buffer = ByteBuffer.wrap(packed);
            byte[] nonce = new byte[NONCE_LENGTH];
            buffer.get(nonce);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes(), "AES"), new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
            return new String(cipher.doFinal(ciphertext), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not read protected data; check DATA_ENCRYPTION_KEY", exception);
        }
    }

    public String lookupHash(String value) {
        if (!isConfigured()) throw new IllegalStateException("Encrypted data storage is not configured");
        try {
            byte[] key = keyBytes();
            byte[] context = "safearrival-email-lookup-v1".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            byte[] material = new byte[key.length + context.length];
            System.arraycopy(key, 0, material, 0, key.length);
            System.arraycopy(context, 0, material, key.length, context.length);
            byte[] derivedKey = java.security.MessageDigest.getInstance("SHA-256").digest(material);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(derivedKey, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not create protected lookup hash", exception);
        }
    }

    private byte[] keyBytes() {
        try {
            return Base64.getDecoder().decode(encodedKey);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("DATA_ENCRYPTION_KEY must be valid base64", exception);
        }
    }
}
