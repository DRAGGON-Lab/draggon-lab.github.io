# DRAGGON Lab website

Version 1 website for DRAGGON Lab: Developing, Researching, and Architecting Genetic and Genomic Networks.

Primary message: AI-aided biodesign platforms for programming biological systems.

The site is a modular public map of the DRAGGON Lab ecosystem at the University of Bristol: research interests, tools, publications, Lab Notes, teaching resources, people, project directions, workflows, and datasets.

## Navigation

- Research
- Tools
- Publications
- Lab Notes
- Teaching
- People
- Join / Collaborate

## Research interests

1. Biological Software Foundations
2. Automated DBTL Workflows
3. AI-Aided Biodesign
4. Digital Twins of Living Systems
5. Intelligent Genetic & Genomic Networks

## Tool ecosystem

Design: LOICA.
Build: PUDU and BuildCompiler.
Test: Flapjack workflows and Tricahue when ready.
Learn: SeqTrainer.
Infrastructure: SynBioSuite, SBOLInventory, SBOL/SynBioHub integrations.

## Development

Requires Node.js 22.12.0 or newer and pnpm 10.28.1.

```bash
pnpm install
pnpm dev
```

Production-strict build:

```bash
pnpm build
pnpm preview
```

Preview/draft-aware build:

```bash
pnpm build:preview
pnpm preview
```

## Environment

PUBLIC_DEPLOY_ENV must be one of production, preview, or development. The default build is production-strict.

## Documentation

- docs/architecture.md
- docs/design-spec.md
- docs/content-model.md
- docs/implementation-plan.md
- docs/decisions.md
- docs/deployment.md
- docs/roadmap.md

## Public site graph

The site exposes /site-graph.json, a machine-readable map of published research areas, tools, publications, Lab Notes, teaching resources, workflows, datasets, project directions, and people.

## License

Code: MIT. Content: CC BY 4.0 unless otherwise noted. Logos and branding reserved.
