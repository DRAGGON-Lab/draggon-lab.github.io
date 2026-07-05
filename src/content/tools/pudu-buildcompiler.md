---
title: Build - PUDU and BuildCompiler
summary: Build-planning and automation tools that translate biological designs into assembly, transformation, and sample-generation workflows.
tags: [build, automation, DNA assembly]
draft: false
ecosystem_group: build
lifecycle_stage: build
status: active
supports:
  - target: research:automated-dbtl-workflows
enables:
  - target: project-direction:programmatic-dbtl-workflows
---

PUDU and BuildCompiler represent the build layer of the DRAGGON ecosystem. Their role is to translate standardized designs into practical build plans, automation-ready instructions, and traceable metadata that connect design intent with the physical creation of engineered organisms and samples.

## Role in the ecosystem

The build layer connects designs from LOICA or SBOL-based workflows to DNA assembly, transformation, plating, and sample-generation steps. This keeps the build process close to the design representation and allows metadata to be captured as part of the engineering workflow rather than added manually later.

## Near-term direction

A first website-facing description should emphasize complete build workflows: part and plasmid indexing, assembly planning, strain creation, transformation, plating, and outputs that can be used by humans or lab automation systems.

## Why it matters

Build automation is central to reproducibility. When assembly and strain-generation steps are represented consistently, the same design can be reused, audited, adapted, and connected to downstream test and learning stages.
