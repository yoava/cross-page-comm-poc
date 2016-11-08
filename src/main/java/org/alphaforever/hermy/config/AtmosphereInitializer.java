package org.alphaforever.hermy.config;

import org.atmosphere.cpr.ContainerInitializer;
import org.springframework.boot.web.servlet.ServletContextInitializer;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.Collections;

/**
 * @author Yoav Aharoni
 */
class AtmosphereInitializer extends ContainerInitializer implements ServletContextInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        onStartup(Collections.<Class<?>>emptySet(), servletContext);
    }
}
