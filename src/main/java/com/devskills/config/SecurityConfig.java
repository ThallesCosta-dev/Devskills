package com.devskills.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Define a cadeia de filtros de segurança (Chain of Responsibility).
     * Cada requisição passará por esta cadeia para ser autenticada e autorizada.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desabilitado pois usamos JWT (Stateless)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/api/posts/**", "/api/jobs/**", "/api/devskills/profile/**").permitAll()
                .requestMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
                .anyRequest().authenticated()
            )
            // Configura a aplicação como Resource Server que aceita JWTs
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            );

        return http.build();
    }
}
