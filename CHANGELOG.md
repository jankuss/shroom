# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.14] - 2020-12-09

### Added

- Door visualization for room

### Changed

- Figure assets dumping behavior

### Fixed

- Furniture & Avatar textures when display is scaled

**Breaking Change**: Figure images now get dumped into a separate subdirectory corresponding to the library name. You will need to delete your old `figure` folder and rerun the `shroom dump` command to regenerate those resources.
