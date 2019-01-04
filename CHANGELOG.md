# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres roughly to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Added
- Barcode width factor 1.0.
### Changed
- Variables are displayed within groups. The config list for variables was changed to accommodate this and to allow for overriding with a different variable list.
### Fixed

## [0.1.7] - 2018-08-27
### Changed
- UI tries to avoid page scrolling. Toolbars remain on top while scrolling the canvas.
### Fixed
- Broken label after an undo operation when almost all shapes became selected.

## [0.1.6] - 2018-08-22
### Added
- Add the "Lato Light" font for use in text boxes only (not for variables). i.e. this font can be included in the background image, but variables only use fonts that are readily available to the print server.
### Changed
- Redesign of the toolbars:
    - Layout changed.
    - Using embedded SVG icons.
    - Fix behaviour for when to make the stroke width dropdown available.

## [0.1.5] - 2018-08-08
### Changed
- Font pixel sizes are boosted by a factor depending on the printer resolution (8 or 12 px/mm). This allows the label to print fonts at a more accurate size - closely matching the size when printed from a word processor.
### Fixed
- When an existing label is loaded and a shape uses a pixel size for a font that is no longer available, the closest pixel size is chosen and that font size is used instead.

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
