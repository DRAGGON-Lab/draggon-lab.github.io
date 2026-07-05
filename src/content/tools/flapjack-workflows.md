---
title: Test - Flapjack workflows
summary: Experimental data and metadata workflows for characterizing engineered systems and feeding DBTL learning loops.
tags: [test, metadata, characterization]
draft: false
ecosystem_group: test
lifecycle_stage: test
status: active
supports:
  - target: research:automated-dbtl-workflows
  - target: project-direction:standards-programmable-biology
produces:
  - target: dataset:standardized-gene-expression-regulation
---

Flapjack workflows form a key test-and-characterization layer for DRAGGON Lab. They connect experimental measurements, growth data, gene expression profiles, and contextual metadata so that results can be reused for modeling and design.

## Role in the ecosystem

In a DBTL workflow, Flapjack receives plate-reader and characterization data from engineered systems, stores measurements in a structured form, and supports downstream analysis of genetic components and network behavior.

## Learning loop

The value of test data increases when it is calibrated, contextualized, and connected back to design metadata. These workflows support the production of reusable datasets for mechanistic parameterization, inverse-problem analysis, and machine-learning models.

## Near-term direction

The lab will use Flapjack-style workflows to characterize synthetic genes and genetic networks across contexts, then connect those datasets to SeqTrainer and SynBioHub so that standardized designs, metadata, and measurements can be learned from together.
