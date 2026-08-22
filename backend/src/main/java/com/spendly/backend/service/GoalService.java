package com.spendly.backend.service;

import com.spendly.backend.dto.goal.GoalRequest;
import com.spendly.backend.dto.goal.GoalResponse;
import com.spendly.backend.entity.Goal;
import com.spendly.backend.exception.ResourceNotFoundException;
import com.spendly.backend.repository.GoalRepository;
import com.spendly.backend.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    @Transactional
    public GoalResponse create(GoalRequest request) {
        Goal goal = new Goal();
        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setDeadline(request.deadline());
        goalRepository.save(goal);
        return toResponse(goal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> listAll() {
        return goalRepository.findAllByTenantId(TenantContext.get()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GoalResponse update(UUID id, GoalRequest request) {
        Goal goal = findOrThrow(id);
        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setDeadline(request.deadline());
        return toResponse(goal);
    }

    @Transactional
    public void delete(UUID id) {
        Goal goal = findOrThrow(id);
        goalRepository.delete(goal);
    }

    private Goal findOrThrow(UUID id) {
        return goalRepository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    private GoalResponse toResponse(Goal g) {
        return new GoalResponse(g.getId(), g.getName(), g.getTargetAmount(), g.getSavedAmount(), g.getDeadline());
    }
}