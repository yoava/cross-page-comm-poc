package org.alphaforever.hermy;

import org.alphaforever.hermy.config.AtmosphereConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Import;

@EnableAutoConfiguration
@Import(AtmosphereConfig.class)
public class HermyServer {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(HermyServer.class, args);
    }
}
