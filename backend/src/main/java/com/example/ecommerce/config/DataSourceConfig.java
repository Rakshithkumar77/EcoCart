package com.example.ecommerce.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    // Cloud: Neon / Render provide a full postgresql:// URL
    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    // Local fallback: MySQL
    @Value("${DB_URL:jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}")
    private String dbUrl;

    @Value("${DB_USERNAME:root}")
    private String dbUsername;

    @Value("${DB_PASSWORD:rks@7411}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            // Cloud deployment: parse postgresql:// or postgres:// URL from Neon/Render
            log.info("Using DATABASE_URL for cloud PostgreSQL (Neon)");
            String url = databaseUrl.trim();
            if ((url.startsWith("\"") && url.endsWith("\"")) || (url.startsWith("'") && url.endsWith("'"))) {
                url = url.substring(1, url.length() - 1).trim();
            }

            if (url.startsWith("jdbc:")) {
                config.setJdbcUrl(url);
            } else {
                String clean = url.replaceFirst("^postgres(ql)?://", "");
                if (clean.contains("@")) {
                    String[] parts = clean.split("@", 2);
                    String credentials = parts[0];
                    String hostAndRest = parts[1];

                    if (credentials.contains(":")) {
                        String[] userPass = credentials.split(":", 2);
                        config.setUsername(userPass[0]);
                        config.setPassword(userPass[1]);
                    } else {
                        config.setUsername(credentials);
                    }
                    config.setJdbcUrl("jdbc:postgresql://" + hostAndRest);
                } else {
                    config.setJdbcUrl("jdbc:postgresql://" + clean);
                }
            }
            config.setDriverClassName("org.postgresql.Driver");
        } else {
            // Local development: MySQL
            log.info("Using DB_URL for local MySQL connection");
            config.setJdbcUrl(dbUrl.trim());
            config.setUsername(dbUsername.trim());
            config.setPassword(dbPassword.trim());
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        }

        config.setMinimumIdle(2);
        config.setMaximumPoolSize(5);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(30000);
        config.setKeepaliveTime(30000);

        return new HikariDataSource(config);
    }
}
