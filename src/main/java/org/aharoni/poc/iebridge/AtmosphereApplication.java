package org.aharoni.poc.iebridge;

import org.aharoni.poc.iebridge.config.AtmosphereConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Import;

@EnableAutoConfiguration
@Import(AtmosphereConfig.class)
public class AtmosphereApplication {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(AtmosphereApplication.class, args);
    }
}
