package com.abad.service.alert.services.abstractions;

import com.abad.service.alert.dtos.request.AlertCreateRequest;
import com.abad.service.alert.dtos.response.AlertResponse;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface AlertService {

    AlertResponse createAlert(AlertCreateRequest request);
    void deleteAlert(Long id);
    AlertResponse getAlertById(Long id);
    List<AlertResponse> getAllAlerts();
    SseEmitter subscribeClient();
    AlertResponse broadcastAlert(AlertCreateRequest alertCreateRequest);
    SseEmitter subscribeClient(String userId);
    AlertResponse uniCastAlert(String userId, AlertCreateRequest request);


}

