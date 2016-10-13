package org.aharoni.poc.iebridge;

import org.atmosphere.config.service.Disconnect;
import org.atmosphere.config.service.ManagedService;
import org.atmosphere.config.service.Message;
import org.atmosphere.config.service.Ready;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import static org.aharoni.poc.iebridge.config.AtmosphereConfig.SOCKET_URL_PREFIX;

@ManagedService(path = "/" + SOCKET_URL_PREFIX + "/{id}")
public class WebSocketService {
    private static final Logger log = LoggerFactory.getLogger(WebSocketService.class);

    @Ready
    public void onReady(final AtmosphereResource resource) {
        resource.getBroadcaster().broadcast("{\"message\":\"connect\"}");
        log.info("Connected", resource.uuid());
    }

    @Disconnect
    public void onDisconnect(AtmosphereResourceEvent event) {
        log.info("Client {} disconnected [{}]", event.getResource().uuid(), (event.isCancelled() ? "cancelled" : "closed"));
    }

    @Message
    public String onMessage(String message) throws IOException {
        log.info("Author {} sent message {}", message);
        return message;
    }
}
