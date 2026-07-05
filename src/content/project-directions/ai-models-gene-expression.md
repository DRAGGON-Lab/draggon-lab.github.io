---
title: AI Models for Gene Expression
summary: Graph, sequence, hybrid, and foundation models for predicting gene expression and regulation from standardized biological designs.
tags: [AI/ML, gene expression, benchmarking]
draft: false
enables:
  - target: research:ai-aided-biodesign
uses:
  - target: tool:seqtrainer
  - target: dataset:standardized-gene-expression-regulation
---

This project direction develops AI and hybrid modeling workflows for gene expression and regulation. The aim is to use standardized designs, metadata, and measurements to train models that are both useful for prediction and meaningful for biological engineering.

## Modeling approach

The lab will compare graph neural networks, transformer-based DNA sequence models, multimodal models, and hybrid models that combine mechanistic assumptions with learned relationships. The key question is how much biological context a model needs to make useful predictions across designs and environments.

## Data approach

Data will come from DRAGGON DBTL workflows and from carefully selected published datasets. SeqTrainer will help convert designs and measurements into formats that support fair comparisons between models.

## Early milestones

Initial milestones include a benchmark-ready gene-expression dataset, baseline models for sequence-to-expression and graph-to-expression prediction, and a public framework for comparing models across inference tasks in genetic and genomic engineering.
