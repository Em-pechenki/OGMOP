package com.example.demo.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Connection
import java.sql.DriverManager

@RestController
class UserController {

    @GetMapping("/users")
    fun findUser(@RequestParam name: String): String {
        val conn: Connection = DriverManager.getConnection("jdbc:postgresql://localhost/db", "admin", "admin123")
        // SQL injection via string concatenation
        val query = "SELECT * FROM users WHERE name = '" + name + "'"
        val stmt = conn.createStatement()
        val rs = stmt.executeQuery(query)
        return if (rs.next()) rs.getString("name") else "not found"
    }
}