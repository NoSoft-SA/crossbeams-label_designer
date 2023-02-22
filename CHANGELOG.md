# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres roughly to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Added
### Changed
### Fixed
- Static barcodes need to be included in the total count in the variables XML

## [2.0.0] - 2022-10-27
### Added
- Compound variables can render as barcodes.
### Changed

## [1.0.0] - 2021-05-23

Version 1.0. Major Konva upgrade and redesign of most aspects of designer.

- Changed persistence strategy to store shape descriptions, rather than full Konva JSON dump.
- Multiselect capabilities with alignment etc.
- Full-featured undo/redo facility.
- Remove overlapping constraints.
- Lines can only be horizontal or vertical.
- Variables position based on text's baseline, not top-left which makes lining-up text much easier.
- Error-correction options for QR codes.

### Changed
- Upgrade Konva library
- Refactor for version 1.0.0.
- Rake task to upgrade application's label designer javascript from gem.

## [0.2.4] - 2021-03-10
### Added
- White-on-black option for variables. If set, the variable will be printed using white text.
### Changed
- Barcode width format set in increments of 0.1 instead of 0.5.
### Fixed
- Select for compound fields was being cleared of items.

## [0.2.3] - 2019-06-28
### Changed
- Use the Choices.js library instead of Selectr.js library for decorating select boxes.

## [0.2.2] - 2019-06-11
### Changed
- Label margins introduced. All label work areas are reduced by (1mm * px/mm) in width and height. A border displays where the margin is.

## [0.2.1] - 2019-04-16
### Added
- Compound variables can be designed by building up a variable from other variables and arbitrary text.

## [0.2.0] - 2019-03-29
### Added
- The ability to create static barcode variables. These print as barcodes, but their value is fixed in the design, not dynamically applied at print time.

## [0.1.8] - 2019-01-04
### Added
- Barcode width factor 1.0.
### Changed
- Variables are displayed within groups. The config list for variables was changed to accommodate this and to allow for overriding with a different variable list.

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
