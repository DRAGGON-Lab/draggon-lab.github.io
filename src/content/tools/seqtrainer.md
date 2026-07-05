---
title: Learn - SeqTrainer
summary: Machine-learning workflows that transform standardized synthetic biology data into model-ready tables, graphs, sequences, and benchmarks.
tags: [learning, models, benchmarks]
draft: false
ecosystem_group: learn
lifecycle_stage: learn
status: active
supports:
  - target: research:ai-aided-biodesign
uses:
  - target: dataset:standardized-gene-expression-regulation
enables:
  - target: project-direction:ai-models-gene-expression
---

SeqTrainer is the learning layer of the DRAGGON ecosystem. It helps convert standardized biological designs, metadata, and experimental measurements into formats that can be used for machine learning, benchmarking, and model comparison.

## Role in the ecosystem

SeqTrainer connects SBOL and SynBioHub-style design data with model-ready representations. These may include tabular features, DNA sequences, graph-structured biological designs, metadata rooted in ontologies, and experimental measurements from Flapjack-style workflows.

## Model targets

Near-term targets include prediction of gene expression and regulation, benchmarking of graph neural networks and transformer-based sequence models, and support for hybrid approaches that combine mechanistic constraints with data-driven inference.

## Why it matters

AI for biology depends on data quality, context, and consistent representation. SeqTrainer helps turn reusable DBTL outputs into datasets that can support interpretable prediction, model comparison, and community-level progress.
