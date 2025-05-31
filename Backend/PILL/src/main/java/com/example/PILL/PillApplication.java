package com.example.PILL;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PillApplication {

	public static void main(String[] args) {
		SpringApplication.run(PillApplication.class, args);
	}

}
