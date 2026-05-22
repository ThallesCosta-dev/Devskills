package com.devskills;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void givenValidJwt_whenAccessProtectedEndpoint_thenReturnsOk() throws Exception {
        // Simula uma requisição com um Token JWT válido (Mockado)
        mockMvc.perform(get("/api/devskills/me")
                .with(jwt().jwt(jwt -> jwt
                        .claim("sub", "uuid-do-usuario-1234")
                        .claim("email", "dev@devskills.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("uuid-do-usuario-1234"))
                .andExpect(jsonPath("$.email").value("dev@devskills.com"));
    }

    @Test
    public void givenNoJwt_whenAccessProtectedEndpoint_thenReturnsUnauthorized() throws Exception {
        // Simula uma requisição sem token JWT
        mockMvc.perform(get("/api/devskills/me"))
                .andExpect(status().isUnauthorized()); // Espera um HTTP 401
    }

    @Test
    public void givenValidJwtWithoutAdminScope_whenAccessAdminEndpoint_thenReturnsForbidden() throws Exception {
        // Simula uma requisição para rota administrativa com token sem autoridade SCOPE_admin
        mockMvc.perform(get("/api/admin/users")
                .with(jwt().jwt(jwt -> jwt
                        .claim("sub", "uuid-do-usuario-1234")
                        .claim("email", "dev@devskills.com"))))
                .andExpect(status().isForbidden()); // Espera um HTTP 403
    }
}
