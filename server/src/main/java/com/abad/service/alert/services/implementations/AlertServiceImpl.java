package com.abad.service.alert.services.implementations;

import com.abad.service.alert.dtos.request.AlertCreateRequest;
import com.abad.service.alert.dtos.response.AlertResponse;
import com.abad.service.alert.entities.Alert;
import com.abad.service.alert.entities.User;
import com.abad.service.alert.repositories.AlertRepository;
import com.abad.service.alert.repositories.UserRepository;
import com.abad.service.alert.services.abstractions.AlertService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final Map<String, List<SseEmitter>> uniCastEmitters = new ConcurrentHashMap<>();

    @Override
    public AlertResponse createAlert(AlertCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Alert alert = new Alert();
        alert.setDescription(request.description());
        alert.setType(request.type());
        alert.setUser(user);

        Alert saved = alertRepository.save(alert);
        return mapToResponse(saved);
    }

    @Override
    public void deleteAlert(Long id) {
        if (!alertRepository.existsById(id)) {
            throw new RuntimeException("Alert not found");
        }
        alertRepository.deleteById(id);
    }

    @Override
    public AlertResponse getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        return mapToResponse(alert);
    }

    @Override
    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SseEmitter subscribeClient() {
        SseEmitter emitter = new SseEmitter(0L); // No timeout
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("connected")
                    .reconnectTime(3000)); // optional
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    @Override
    public SseEmitter subscribeClient(String userName) {
        SseEmitter emitter = new SseEmitter(0L); // No timeout

        uniCastEmitters.computeIfAbsent(userName, key -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> uniCastEmitters.getOrDefault(userName, List.of()).remove(emitter));
        emitter.onTimeout(() -> uniCastEmitters.getOrDefault(userName, List.of()).remove(emitter));
        emitter.onError(e -> uniCastEmitters.getOrDefault(userName, List.of()).remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("connected")
                    .reconnectTime(3000));
        } catch (IOException e) {
            uniCastEmitters.remove(userName);
        }

        return emitter;
    }

    @Override
    public AlertResponse broadcastAlert(AlertCreateRequest alertCreateRequest) {
        AlertResponse alertResponse = createAlert(alertCreateRequest);
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("new-alert")
                        .data(alertResponse)
                        .id(String.valueOf(alertResponse.id())));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
        return alertResponse;
    }

    @Override
    public AlertResponse uniCastAlert(String userName, AlertCreateRequest request) {
        AlertResponse alert = createAlert(request);

        List<SseEmitter> userEmitters = uniCastEmitters.get(userName);
        if (userEmitters != null) {
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(userName)
                            .data(alert)
                            .id(String.valueOf(alert.id())));
                } catch (IOException e) {
                    userEmitters.remove(emitter);
                }
            }
        }

        return alert;
    }

    private AlertResponse mapToResponse(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getType(),
                alert.getDescription(),
                alert.getUser().getId(),
                alert.getUser().getName()
        );
    }

}
