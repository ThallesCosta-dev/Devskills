package com.devskills;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class DevSkillsApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevSkillsApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDatabaseSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE developer ALTER COLUMN bio TYPE text;");
				System.out.println("Tabela 'developer' atualizada com sucesso (bio -> text).");
			} catch (Exception e) {
				System.out.println("Aviso: Não foi possível alterar o tipo da coluna bio (talvez já seja text): " + e.getMessage());
			}
		};
	}
}
