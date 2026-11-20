plugins {
    kotlin("jvm") version "1.9.24"
    kotlin("plugin.spring") version "1.9.24"
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework:spring-beans:5.3.10")
    implementation("org.springframework:spring-expression:5.3.10")
    implementation("org.springframework.security:spring-security-core:5.4.2")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.12.3")
    implementation("io.netty:netty-codec:4.1.60")
    implementation("io.netty:netty-handler:4.1.50")
    implementation("org.yaml:snakeyaml:1.29")
    implementation("org.json:json:20220320")
    implementation("com.google.protobuf:protobuf-java:3.15.0")
    runtimeOnly("org.postgresql:postgresql:42.3.1")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
}