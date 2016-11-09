package org.alphaforever.hermy.service;

import org.atmosphere.config.service.*;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import static org.alphaforever.hermy.config.AtmosphereConfig.SOCKET_URL_PREFIX;

@ManagedService(path = "/" + SOCKET_URL_PREFIX + "/{id}")
public class WebSocketResource {
    private static final Logger log = LoggerFactory.getLogger(WebSocketResource.class);

    @PathParam("id")
    private String id;

    @Ready
    public void onReady(final AtmosphereResource resource) {
        resource.getBroadcaster().broadcast("{\"$type\":\"$connected\",\"id\":\"" + id + "\"}");
        log.info("Connected uuid={}, cid={}", resource.uuid(), id);
    }

    @Disconnect
    public void onDisconnect(AtmosphereResourceEvent event) {
        log.info("Client {} disconnected [{}]", event.getResource().uuid(), (event.isCancelled() ? "cancelled" : "closed"));
    }

    @Message
    public String onMessage(String message) throws IOException {
        log.debug("Message sent", message);
        return message;
    }
}
