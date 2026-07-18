# Knowledge Graph Index

## Read When

- Before impact analysis, cross-layer development, or project relationship lookup.

## Owner

- Project Assistant

## Update Trigger

- docs/knowledge/project-graph.json changes.

## Validation

- Summary reflects current graph nodes and major relationships.

## Activation

- KG1/KG2/KG3 only. Do not use for simple consultations.

## Summary

- KG3 updated on 2026-07-18 for the KeeperHub execution phase.
- 11 active nodes and 11 confirmed edges cover the execution feature, server adapter, status/simulate APIs, registry contract, approval gate, offline preflight, unit/E2E validation, ADR, and public-hosting risk.
- Primary path: `feature.bounty-proof-execution` → `api.proofs-simulate` → `module.keeperhub-client` → `contract.opportunity-registry`.
- Safety path: `adr.simulation-before-broadcast` + `config.keeperhub-simulation-gate` mitigate `risk.public-simulation-auth`; real broadcast remains absent.
