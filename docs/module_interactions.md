# Module Interactions Overview

This document summarizes how newly added e‑book conversion modules integrate with existing components in Anclora Metaform.

## Frontend
- **EbookConverterPage** leverages the existing navigation system in `Header` to switch between the universal converter and the specialized e‑book workflow.
- Shared design tokens in `index.css` ensure visual consistency with legacy components.
- The format selector and metadata viewer reuse utility hooks already present in the universal converter, minimizing code duplication.

## Backend
- New services under `src/nexus` extend the existing conversion engine to handle e‑book formats while preserving the universal API contract.
- Database models for conversions and user credits remain unchanged, so historical data and credit tracking operate seamlessly with e‑book requests.
- Background tasks responsible for file normalization and cleanup are shared between old and new modules, maintaining uniform retention policies.

## Compatibility
- The e‑book modules interact with existing authentication and credit systems without requiring schema changes.
- Both converters emit progress updates over the same WebSocket channel, allowing the frontend to monitor status uniformly.

## Observability
- A new metrics module exposes Prometheus data at `/metrics`, integrating with existing services without altering API contracts.
- Centralized request logging reuses Flask's logging system, so authentication and conversion modules emit uniform logs.

These interactions were reviewed after integration to verify that legacy functionality continues to operate alongside the new e‑book features.
