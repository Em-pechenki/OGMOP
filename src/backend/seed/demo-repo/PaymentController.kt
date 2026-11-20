package com.example.demo.payment

import org.springframework.web.bind.annotation.*
import java.sql.Connection
import java.sql.DriverManager

@RestController
class PaymentController {

    // Hardcoded credentials (should be externalized)
    private val dbPassword = "PaymentSecret999!"

    @GetMapping("/payments")
    fun findPayments(@RequestParam userId: String): String {
        val conn: Connection = DriverManager.getConnection("jdbc:postgresql://localhost/payments", "admin", "admin123")
        // SQL injection via string concatenation
        val query = "SELECT * FROM payments WHERE user_id = '" + userId + "'"
        val stmt = conn.createStatement()
        val rs = stmt.executeQuery(query)
        return if (rs.next()) rs.getString("amount") else "not found"
    }

    fun endpoint(): String = "http://example.com/payments"
}