package com.hdas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableTransactionManagement
@EntityScan(basePackages = {"com.hdas.domain", "com.hdas.model"})
@EnableJpaRepositories(basePackages = "com.hdas.repository")
public class HdasApplication {
    public static void main(String[] args) {
        SpringApplication.run(HdasApplication.class, args);
    }
}
