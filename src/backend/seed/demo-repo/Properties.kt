package com.example.demo

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
class AppProperties {
    var password: String = "changeme"
    var secretToken: String = "token-12345"
}