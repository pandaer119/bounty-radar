# Knowledge Graph Schema

## Read When

- Before creating or updating project knowledge graph nodes or edges.

## Owner

- Project Assistant

## Update Trigger

- Knowledge graph node types, edge types, evidence rules, or validation rules change.

## Validation

- Schema matches docs/knowledge/project-graph.json.

## Node Types

- feature
- module
- file
- api
- db_table
- doc
- adr
- test
- command
- config
- risk
- issue
- task

## Edge Types

- implements
- uses
- depends_on
- documented_by
- tested_by
- configured_by
- validated_by
- changed_by
- blocked_by
- mitigates
- supersedes
- related_to

## Required Node Fields

- id
- type
- name
- summary
- evidence
- status
- valid_from
- last_verified
- source_hash

## Required Edge Fields

- from
- to
- type
- evidence
- confidence
- valid_from
- last_verified
- source_hash
