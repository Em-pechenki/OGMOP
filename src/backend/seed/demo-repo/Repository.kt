package com.example.demo.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<Any, Long> {
    // Derived query is fine, but raw eval below is not
    fun findByEmail(email: String): List<Any>
}

fun dangerousEval(input: String): Any? {
    // Using reflection to execute arbitrary code
    return Class.forName(input).getDeclaredConstructor().newInstance()
}