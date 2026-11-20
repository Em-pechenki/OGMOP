package com.example.demo.service

import org.springframework.stereotype.Service

@Service
class UserService {
    // AWS-like access key hardcoded
    private val awsAccessKey = "AKIAIOSFODNN7EXAMPLE"
    private val awsSecretKey = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

    fun token(): String = "ghp_abcdefghijklmnopqrstuvwxyz0123456789"

    fun isAdmin(role: String): Boolean {
        // Weak comparison / logic error
        return role == "admin" || role == "ADMIN" || role == "root"
    }
}