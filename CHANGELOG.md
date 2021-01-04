# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add Avatar placeholder when loading
- Furniture will now only use valid directions
- `screenPosition` property for `Avatar`
- Add `BaseAvatar` for rendering avatars without a room
- Add `BaseFurniture` for rendering furniture without a room
- Add `onActiveTileChange` events for detecing hovered tile (useful for furniture placement preview)
- Add ability to share a shroom instance with multiple applications through `Shroom.createShared`
- Furniture will now only use valid directions

### Change

- Change default wall color to use the original

### Fixed

- Fix bug in AvatarSprites when updating without being mounted
- Fix wall display for some room models
- Fix alpha for furniture
- Tile Cursor now shows above flooring items
- Fix `RoomCamera` drag stopping when going over dom elements
- Fix `RoomCamera` drag passing through other PIXI elements
- Fix Avatar hair clipping through hats
- Fix Avatar sleeves for some T-Shirts because library wasn't detected
- Fix animations for some furnitures
- Fix wall border showing for tiles on a higher level than the wall

## [0.2.0] - 2020-12-27

### Added

- Furniture property for alpha (thanks @sindreslungaard)
- **Avatar Refactor**

  Large parts of the avatar rendering has been refactored to match the vanilla flash rendering of avatars.
  This means:

  - Easy handling of **all** actions through `addAction`, `removeAction` and `hasAction`
  - Loading and display of avatar items

- Expose `MouseEvent` in hit detection through the `mouseEvent` property
- Expose data in `index.bin` through `extradata` on furniture
- Expose valid directions through `validDirections` on furniture

### Fixed

- Parsing of walls

## [0.1.8] - 2020-12-24

### Fixed

- Cause of random crashes during asset extraction

## [0.1.7] - 2020-12-19

### Fixed

- Fixed cache issue when loading colored furniture
- Tile Map Parser: Allow doors in first column of tilemap

## [0.1.6] - 2020-12-19

### Fixed

- Furniture fetching by id differentiates between wall and floor items

## [0.1.5] - 2020-12-19

### Added

- Ability to fetch furniture by id

### Changed

- Improve furniture movement animations performance

### Fixed

- Z-Ordering of furniture on the same tile

## [0.1.4] - 2020-12-17

### Added

- Highlight State for Furniture

### Changed

- **BREAKING:** Tile Map Parsing behavior

  Tile map parsing is now equal to how the original tilemaps work. That means each row and column should be padded with an empty (`x`) tile. So for example:

  ```
  00
  00
  ```

  becomes

  ```
  xxx
  x00
  x00
  ```

### Fixed

- Regression where landscapes for some walls don't work

## [0.1.3] - 2020-12-15

### Added

- `Room` improvements
  - `removeRoomObject` method to remove an object from a room
  - `roomObjects` to access all present room objects
- Ability to dump and use furniture when revision is not set
- Add `move` method for moving `FloorFurniture` and `Avatar` objects
- Add `RoomCamera` class for handling drag, drop & snapback for a `Room` (thanks @mtwzim)

### Changed

- `roomHeight` & `roomWidth` now return the actual height and width of the room

### Fixed

- Cross Origin issue with `HitTexture`

## [0.1.2] - 2020-12-13

### Added

- Ability to set landscapes, which are seen through windows

### Fixed

- Click handling on furniture when a sprite is mirrored
- Furniture loading of colored items (i.e. `rare_dragonlamp*4`)

## [0.1.0-alpha.14] - 2020-12-09

### Added

- Door visualization for room

### Changed

- **BREAKING**: Figure assets dumping behavior.
  Figure images now get dumped into a separate subdirectory corresponding to the library name. You will need to delete your old `figure` folder and rerun the `shroom dump` command to regenerate those resources.

### Fixed

- Furniture & Avatar textures when display is scaled
