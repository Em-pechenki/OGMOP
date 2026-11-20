package com.example.demo.security

class JwtUtil {
    // Hardcoded JWT secret
    private val jwtSecret = "super-secret-jwt-key-1234567890"

    fun createToken(role: String): String {
        // Weak role comparison
        if (role == "root") {
            return "admin-token"
        }
        return "user-token"
    }

    fun isWeak(role: String): Boolean = role == "admin" || role == "ADMIN"
}