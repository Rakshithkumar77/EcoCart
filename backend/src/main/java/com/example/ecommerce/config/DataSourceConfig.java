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

    @Value("${DATABASE_URL:}")
    private String renderDatabaseUrl;

    @Value("${DB_URL:jdbc:postgresql://localhost:5432/ecommerce_db}")
    private String dbUrl;

    @Value("${DB_USERNAME:postgres}")
    private String dbUsername;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        HikariConfig config = new HikariConfig();

        if (renderDatabaseUrl != null && !renderDatabaseUrl.isEmpty()) {
            // Parse Render's postgres:// internal URL format
            log.info("Using DATABASE_URL (Render internal network)");
            URI dbUri = new URI(renderDatabaseUrl);
            String userInfo = dbUri.getUserInfo();
            String user = userInfo.split(":")[0];
            String pass = userInfo.split(":")[1];
            int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
            String jdbc = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

            config.setJdbcUrl(jdbc);
            config.setUsername(user);
            config.setPassword(pass);
        } else {
            // Use standard JDBC DB_URL
            log.info("Using DB_URL for database connection");
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
