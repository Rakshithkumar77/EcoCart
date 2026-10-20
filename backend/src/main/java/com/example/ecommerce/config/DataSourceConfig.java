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
    public DataSource dataSource() throws URISyntaxException {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            // Cloud deployment: parse postgresql:// or postgres:// URL from Neon/Render
            log.info("Using DATABASE_URL for cloud PostgreSQL (Neon)");
            String url = databaseUrl;
            // Normalize postgres:// -> postgresql://
            if (url.startsWith("postgres://")) {
                url = url.replaceFirst("postgres://", "postgresql://");
            }
            URI dbUri = new URI(url);
            String userInfo = dbUri.getUserInfo();
            String user = userInfo.split(":")[0];
            String pass = userInfo.split(":")[1];
            int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
            String query = dbUri.getRawQuery() != null ? "?" + dbUri.getRawQuery() : "";
            String jdbc = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath() + query;

            config.setJdbcUrl(jdbc);
            config.setUsername(user);
            config.setPassword(pass);
        } else {
            // Local development: MySQL
            log.info("Using DB_URL for local MySQL connection");
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUsername);
            config.setPassword(dbPassword);
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
