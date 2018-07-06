# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres roughly to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Added
### Changed
### Fixed

## [0.1.4] - 2018-07-06
### Changed
- Konva 2.1.7: stage events are slightly changed. mousedown, click, mouseup, dblclick, touchstart, touchend, tap, dbltap will be triggered when clicked on empty areas too. This change guards against undefined shapes in events.

## [0.1.3] - 2018-06-29
- Page encoding is forced to UTF-8.

## [0.1.2] - 2018-04-10
### Added
- This changelog.
- EAN 128 barcode.
### Fixed
- Problem with group and shape ids getting out of sync.

## [0.1.1] - 2018-02-08
### Changed
- Upgrade to Ruby 2.5.
- Start to use git flow for releases.
