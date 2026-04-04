package com.example.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration // Marks this class as a configuration class for Spring
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic"); // For destinations prefixed with /topic, anyone subscribed will get the messages
    config.setApplicationDestinationPrefixes("/YunoBall"); // Messages sent from clients with this prefix will be routed to message-handling methods
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-YunoBall-testing")
        .setAllowedOrigins("http://localhost:5173")
        .addInterceptors(new CustomInterceptor()) // Add the custom interceptor to the WebSocket handshake process
        .withSockJS(); // Registers the endpoint for WebSocket connections and allows SockJS fallback options
  }

  /* 
  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(webSocketAuthInterceptor);
  }
  */

}