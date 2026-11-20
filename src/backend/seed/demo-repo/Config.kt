package com.example.demo.config

import org.springframework.context.annotation.Configuration

@Configuration
class Config {
    // Hardcoded credentials (should be externalized)
    val dbPassword = "SuperSecret123!"
    val apiKey = "sk-live-1234567890abcdef"
    val jwtSecret = "jwt-secret-key-do-not-share"

    fun getConnectionString(): String {
        return "jdbc:postgresql://localhost:5432/app?user=admin&password=$dbPassword"
    }
}