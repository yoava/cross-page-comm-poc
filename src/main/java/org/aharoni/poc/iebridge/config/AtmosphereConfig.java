package org.aharoni.poc.iebridge.config;

import org.atmosphere.cpr.AtmosphereServlet;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
@EnableAutoConfiguration
public class AtmosphereConfig {
    public static final String SOCKET_URL_PREFIX = "socket";

    @Bean
    public AtmosphereInitializer atmosphereInitializer() {
        return new AtmosphereInitializer();
    }

    @Bean
    public ServletRegistrationBean atmosphereServlet() {
        // Dispatcher servlet is mapped to '/home' to allow the AtmosphereServlet
        // to be mapped to '/chat'
        ServletRegistrationBean registration = new ServletRegistrationBean(new AtmosphereServlet(), "/" + SOCKET_URL_PREFIX + "/*");
        registration.addInitParameter("org.atmosphere.cpr.packages", "sample");
        registration.addInitParameter("org.atmosphere.interceptor.HeartbeatInterceptor.clientHeartbeatFrequencyInSeconds", "10");
        registration.setLoadOnStartup(0);
        // Need to occur before the AtmosphereInitializer
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

}
