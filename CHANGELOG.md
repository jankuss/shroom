# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.4] - 2021-01-24

### Fixed

- Move `canvas` package to normal `dependencies` in `package.json`

## [0.6.3] - 2021-01-23

### Fixed

- Double click handling

## [0.6.2] - 2021-01-23

### Changed

- Improve event handling

### Fixed

- Hit detection for spritesheet textures
- Direction of furniture not changing

## [0.6.1] - 2021-01-23

### Fixed

- Door wall not hiding when `hideWalls` is set to `true`
- `onActiveTileChange` not firing

## [0.6.0] - 2021-01-23

### Added

- Add `onActiveWallChange` - useful for handling wall item placement
- Add `onPointerDown` & `onPointerUp` for furnitures and avatars
- Support unpadded tilemaps
- Secure WebSocket support for `shroom proxy` (thanks @somekindadude)

### Changed

- Mouse events now don't trigger `onTileClick` when `stopPropagation` is called on a avatar or furniture above it
- **BREAKING:**: Asset dumping & loading

  Assets now get dumped into `.shroom` files, instead of individual files. Rerun the `shroom dump` command to regenerate those assets.

- Allow skipping the download on `shroom dump` when omitting the `--url` parameter

### Removed

- Temporarily disable landscapes because of performance issues

### Fixed

- Display of avatar when rendering certain clothing items

## [0.5.1] - 2021-01-13

### Fixed

- Fix exception in `avatar.destroy()`

## [0.5.0] - 2021-01-13

### Added

- `shroom proxy` command: Proxy & translate WebSocket messages to something the emulator will understand
  This enables you to communicate with the emulator through websockets, without making any adjustments to
  the emulator itself.
- Option to hide tile cursor in a room with `room.hideTileCursor`
- BaseFurniture now has a onLoad callback, which gets called after the furniture is fully loaded
- Add `headDirection` option for `avatar.walk()`
- Add corner stairs (thanks @tuttarealstep)
- Add `skipCaching` option to `BaseAvatar` to skip unnecessary caching from the AvatarLoader (thanks @somekindadude)

### Changed

- Providing no direction in `avatar.walk()` doesn't modify the avatars direction now

### Fixed

- Display of furniture with special layer offsets for a direction
- Fix coloring of clothing when changing the look
- Avatar displaying behind bed while laying

## [0.4.1] - 2021-01-10

### Fixed

- Furniture default coloring not being applied
- Fix some furniture layers not showing
- Fix furniture not displaying at all when one asset fails to load

## [0.4.0] - 2021-01-09

### Added

- Customizable furniture visualizations through `furniture.visualization = /*...*/`
- Option to not render body when using `BaseAvatar` (thanks @somekindadude)
- Option to specify `headRotation` for avatars (thanks @somekindadude)

### Changed

- Improve tilemap parsing to handle carriage return in string

### Fixed

- Furniture animations getting stuck
- Avatar zIndex not respected for HitDetection
- Fix directions for furniture with out of order directions in `visualization.bin`
- Fix behaviors called before `BaseFurniture` initialized
- Fix tile cursor displaying above furniture

## [0.3.1] - 2021-01-04

### Fixed

- Avatar `onClick` and `onDoubleClick` not firing
- Wall border hiding for some room models where they shouldn't

## [0.3.0] - 2021-01-04

### Added

- Add Avatar placeholder when loading
- Furniture will now only use valid directions
- `screenPosition` property for `Avatar`
- Add `BaseAvatar` for rendering avatars without a room
- Add `BaseFurniture` for rendering furniture without a room
- Add `onActiveTileChange` events for detecing hovered tile (useful for furniture placement preview)
- Add ability to share a shroom instance with multiple applications through `Shroom.createShared`
- Furniture will now only use valid directions

### Changed

- Change default wall color to use the original
- Improve asset dumping behavior (thanks @thereis)

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
- Fix wall border showing for tiles on a higher level than the wall (thanks @tuttarealstep)

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
