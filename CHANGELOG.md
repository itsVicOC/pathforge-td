# Changelog

All notable changes to PathForge TD are documented in this file.

This project follows a pragmatic changelog format based on Keep a Changelog.

## [Unreleased]

### Added

- Repository-level `README.md` with project overview, quick start, gameplay, controls, structure, documentation links and validation baseline.
- Documentation index in `docs/README.md`.
- Contributor guide in `CONTRIBUTING.md`.
- Release checklist in `docs/Release-Checklist.md`.
- MIT license file.

### Changed

- Documentation coverage now includes repository onboarding, development workflow, release checks and documentation maintenance rules.

## [1.0.0] - 2026-06-26

### Added

- Canvas-based maze tower defense game built with TypeScript and Vite.
- 24 campaign levels from 1-1 to 8-3.
- 8 tower types: archer, cannon, ice, lightning, poison, sniper, support and barracks.
- 13 enemy types including flying units, armored enemies, support enemies, elite abilities and bosses.
- Dynamic A* pathfinding with placement validation to prevent fully blocked paths.
- Tower range preview and placement legality feedback.
- Tower role, description, special effect and usage UI.
- Wave preview and recommended preparation hints.
- Victory flow with next-level option.
- Settings, statistics, save data and achievement systems.
- 100 conditional achievements.
- Regression tests for configuration, pathfinding, tower placement, entities, UI state and game flow.

### Changed

- UI layout and settings page were adjusted for readability and stability.
- Maps and later chapters were expanded and rebalanced for stronger path-shaping gameplay.
- Documentation was rewritten around current implementation instead of old prototype assumptions.

### Fixed

- Placement interactions should keep HUD, tower bar and tower description visible after success or failure.
- Path preview should update route display without moving map tiles.
