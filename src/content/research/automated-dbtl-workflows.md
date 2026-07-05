---
title: Automated DBTL Workflows
summary: Programmatic design-build-test-learn workflows that connect genetic design, build automation, experimental data capture, and learning.
tags: [DBTL, automation, workflows]
draft: false
uses:
  - target: tool:loica
  - target: tool:pudu-buildcompiler
  - target: tool:flapjack-workflows
related_to:
  - target: project-direction:programmatic-dbtl-workflows
produces:
  - target: workflow:programmatic-dbtl-workflow
  - target: dataset:standardized-gene-expression-regulation
---

Automated DBTL workflows are the operational backbone of DRAGGON Lab. The goal is to connect design tools, build planning, laboratory execution, test data, and learning loops so that engineering biological systems becomes more reproducible, modular, and scalable.

## What this means in practice

A design should be represented in a machine-readable form, converted into build plans, assembled or transformed with traceable metadata, tested with calibrated measurements, and returned to databases that can be used for modeling and new design decisions. The workflow should work in a small academic lab but remain compatible with biofoundries and industrial-scale facilities.

## Platform direction

The first platform pattern connects LOICA for genetic network design, PUDU and BuildCompiler for build planning and automation, Tricahue-style metadata capture for test workflows, Flapjack for plate-reader data and characterization, SynBioHub for design and metadata storage, and SeqTrainer for learning from standardized datasets.

## Near-term outputs

Early work will focus on deployable examples that compose synthetic genes, characterize their expression and regulation across contexts, and produce a reusable dataset that can support both mechanistic modeling and AI-enabled biological design.
