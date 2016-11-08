/*
 * Copyright 2012-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.alphaforever.hermy;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketConnectionManager;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = HermyServer.class)
@WebIntegrationTest(randomPort = true)
@DirtiesContext
public class HermesApplicationTests {
    private static Logger log = LoggerFactory.getLogger(HermesApplicationTests.class);

    @Value("${local.server.port}")
    private int port = 1234;

    @Test
    public void chatEndpoint() throws Exception {
        ConfigurableApplicationContext context = new SpringApplicationBuilder(
                ClientConfiguration.class, PropertyPlaceholderAutoConfiguration.class)
                .properties(
                        "websocket.uri:ws://localhost:" + this.port + "/hermy")
                .run("--spring.main.web_environment=false");
        long count = context.getBean(ClientConfiguration.class).latch.getCount();
        AtomicReference<String> messagePayloadReference = context
                .getBean(ClientConfiguration.class).messagePayload;
        context.close();
        assertThat(count, equalTo(0L));
        assertThat(messagePayloadReference.get(),
                containsString("{\"message\":\"test\",\"author\":\"test\",\"time\":"));
    }

    @Configuration
    static class ClientConfiguration implements CommandLineRunner {

        private final CountDownLatch latch = new CountDownLatch(1);
        private final AtomicReference<String> messagePayload = new AtomicReference<String>();
        @Value("${websocket.uri}")
        private String webSocketUri;

        @Override
        public void run(String... args) throws Exception {
            log.info("Waiting for response: latch=" + this.latch.getCount());
            if (this.latch.await(10, TimeUnit.SECONDS)) {
                log.info("Got response: " + this.messagePayload.get());
            } else {
                log.info("Response not received: latch=" + this.latch.getCount());
            }
        }

        @Bean
        public WebSocketConnectionManager wsConnectionManager() {
            WebSocketConnectionManager manager = new WebSocketConnectionManager(client(),
                    handler(), this.webSocketUri);
            manager.setAutoStartup(true);
            return manager;
        }

        @Bean
        public StandardWebSocketClient client() {
            return new StandardWebSocketClient();
        }

        @Bean
        public TextWebSocketHandler handler() {
            return new TextWebSocketHandler() {

                @Override
                public void afterConnectionEstablished(WebSocketSession session)
                        throws Exception {
                    session.sendMessage(new TextMessage(
                            "{\"author\":\"test\",\"message\":\"test\"}"));
                }

                @Override
                protected void handleTextMessage(WebSocketSession session,
                                                 TextMessage message) throws Exception {
                    log.info("Received: " + message + " ("
                            + ClientConfiguration.this.latch.getCount() + ")");
                    session.close();
                    ClientConfiguration.this.messagePayload.set(message.getPayload());
                    ClientConfiguration.this.latch.countDown();
                }
            };
        }

    }

}
