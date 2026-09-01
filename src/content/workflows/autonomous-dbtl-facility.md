---
title: Autonomous DBTL Facility Workflow
summary: A planned facility workflow for scheduling, executing, measuring, storing, recovering, and learning across autonomous DBTL campaigns.
tags: [autonomous laboratories, DBTL, facility orchestration]
draft: false
ecosystem_group: workflow
lifecycle_stage: deploy
status: planned
tool_refs:
  - tool:loica
  - tool:pudu-buildcompiler
  - tool:flapjack-workflows
  - tool:seqtrainer
  - tool:synbiosuite
workflow_refs:
  - workflow:programmatic-dbtl-workflow
outputs:
  - dataset:standardized-gene-expression-regulation
---

The autonomous DBTL facility workflow extends programmatic design-build-test-learn procedures into sustained physical operation. It coordinates software, people, humanoid robots, laboratory automation, instruments, materials, samples, and storage while preserving the intent and provenance of every experiment.

## Workflow stages

1. Translate biological objectives and machine-readable designs into validated experimental plans, resource requirements, and scheduling constraints.
2. Confirm reagent, consumable, sample, equipment, and storage availability before releasing work to the facility.
3. Coordinate liquid handlers and other workcells while humanoid robots prepare decks, transport labware, operate human-oriented equipment, and manage storage handoffs.
4. Capture measurements, operational events, metadata, equipment state, and sample lineage as one traceable record.
5. Validate outcomes and facility state, then retry, replan, use compatible equipment, or enter a safe state and escalate according to the fault class.
6. Return experimental and operational data to models that inform subsequent designs, schedules, and recovery policies.

## Operating principle

Autonomy is bounded by evidence and risk. Routine operations and known recoverable exceptions can proceed without intervention. Uncertain, biologically consequential, or safety-critical situations stop safely and request human judgment with the relevant context already assembled.

## Target capability

The workflow will progress from individual automated workcells to overnight and multi-day facility campaigns. Its long-term target is reliable, auditable DBTL operation for weeks at a time in laboratories where people and autonomous systems can work safely alongside one another.
