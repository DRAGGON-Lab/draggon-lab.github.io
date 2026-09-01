---
title: Programmatic DBTL Workflows
summary: Modular workflows that connect LOICA, PUDU, BuildCompiler, Flapjack, SynBioHub, and SeqTrainer across the engineering cycle.
tags: [DBTL, automation, workflows]
draft: false
enables:
  - target: research:autonomous-laboratories
uses:
  - target: tool:loica
  - target: tool:pudu-buildcompiler
  - target: tool:flapjack-workflows
produces:
  - target: workflow:programmatic-dbtl-workflow
  - target: dataset:standardized-gene-expression-regulation
---

This project direction turns the DRAGGON Lab research vision into runnable biological engineering workflows. The objective is to make each step of design, build, test, and learn explicit enough to automate, validate, and reuse.

## Workflow pattern

A first programmatic workflow starts with genetic network design in LOICA, passes through build planning with PUDU and BuildCompiler, captures experimental metadata and measurements through test workflows, stores design context in SynBioHub, stores characterization data in Flapjack, and sends reusable datasets to SeqTrainer.

## Why this is important

A modular workflow lets collaborators work on different stages without losing context. It also makes it possible to compare designs, build protocols, measurements, and models across projects instead of treating every experiment as a disconnected one-off.

## Early milestones

Early milestones include a complete design-to-data example, sample content for synthetic gene characterization, and documented interfaces between design metadata, build metadata, test outputs, and learning-ready datasets.

## Foundation for autonomy

Programmatic workflows provide the explicit instructions, validation rules, metadata, and interfaces that an autonomous laboratory needs. Facility orchestration and robotics can build on this layer without hiding how biological intent becomes physical work or how experimental evidence returns to the learning cycle.
