export type RoomPosition = {
  /**
   * The x position in the room.
   * The y-Axis is marked in the following graphic:
   *
   * ```
   *    |
   *    |
   *    |
   *   / \
   *  /   \   <- x-Axis
   * /     \
   * ```
   */
  roomX: number;
  /**
   * The y position in the room.
   * The y-Axis is marked in the following graphic:
   *
   * ```
   *              |
   *              |
   *              |
   *             / \
   * y-Axis ->  /   \
   *           /     \
   * ```
   */
  roomY: number;
  /**
   * The z position in the room.
   * The z-Axis is marked in the following graphic:
   *
   * ```
   *              |
   *   z-Axis ->  |
   *              |
   *             / \
   *            /   \
   *           /     \
   * ```
   */
  roomZ: number;
};
