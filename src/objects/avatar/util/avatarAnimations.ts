import { AnimationsXml } from "../../../downloading/dumpAnimations";

function _getPartKey(actionId: string, setType: string, frameNumber: string) {
  return `${actionId}_${setType}_${frameNumber}`;
}

function _getOffsetKey(actionId: string, frameId: string, direction: string) {
  return `${actionId}_${frameId}_${direction}`;
}

class _AvatarAnimations {
  private _parts: Map<
    string,
    { assetpartdefinition: string; repeats: string | undefined }
  > = new Map();

  private _offsets: Map<
    string,
    { id: string; dx: string; dy: string }[]
  > = new Map();

  getAnimation(options: {
    actionId: string;
    frameId: string;
    setType: string;
    direction: string;
  }) {
    const part = this._parts.get(
      _getPartKey(options.actionId, options.setType, options.frameId)
    );
    const offset = this._offsets.get(
      _getOffsetKey(options.actionId, options.frameId, options.direction)
    );

    if (part == null) return;

    return {
      part,
      offsets: offset,
    };
  }

  constructor(animations: AnimationsXml = _avatarAnimations) {
    animations.animationSet.action.forEach((value) => {
      value.part.forEach((part) => {
        part.frame.forEach((frame) => {
          this._parts.set(
            _getPartKey(value.$.id, part.$["set-type"], frame.$.number),
            {
              assetpartdefinition: frame.$.assetpartdefinition,
              repeats: frame.$.repeats,
            }
          );
        });
      });

      value.offsets?.forEach((offset) => {
        offset.frame.forEach((frame) => {
          frame.directions.forEach((directions) => {
            directions.direction.forEach((direction) => {
              this._offsets.set(
                _getOffsetKey(value.$.id, frame.$.id, direction.$.id),
                direction.bodypart.map((bodypart) => bodypart.$)
              );
            });
          });
        });
      });
    });

    console.log(this._parts);
  }
}

const _avatarAnimations: AnimationsXml = {
  animationSet: {
    action: [
      {
        $: { id: "Move" },
        part: [
          {
            $: { "set-type": "bd" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "bds" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "ss" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "lg" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "sh" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "lh" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "lhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "ls" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "lc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "rh" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "rhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "rs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "rc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wlk" } },
              { $: { number: "1", assetpartdefinition: "wlk" } },
              { $: { number: "2", assetpartdefinition: "wlk" } },
              { $: { number: "3", assetpartdefinition: "wlk" } },
            ],
          },
        ],
      },
      {
        $: { id: "Wave" },
        part: [
          {
            $: { "set-type": "lh" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav" } },
              { $: { number: "1", assetpartdefinition: "wav" } },
            ],
          },
          {
            $: { "set-type": "lhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav" } },
              { $: { number: "1", assetpartdefinition: "wav" } },
            ],
          },
          {
            $: { "set-type": "ls" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav" } },
              { $: { number: "1", assetpartdefinition: "wav" } },
            ],
          },
          {
            $: { "set-type": "lc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav" } },
              { $: { number: "1", assetpartdefinition: "wav" } },
            ],
          },
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav" } },
              { $: { number: "1", assetpartdefinition: "wav" } },
              { $: { number: "2", assetpartdefinition: "wav" } },
              { $: { number: "3", assetpartdefinition: "wav" } },
            ],
          },
        ],
      },
      {
        $: { id: "Talk" },
        part: [
          {
            $: { "set-type": "hd" },
            frame: [
              { $: { number: "0", assetpartdefinition: "spk" } },
              { $: { number: "1", assetpartdefinition: "spk" } },
            ],
          },
          {
            $: { "set-type": "fc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "spk" } },
              { $: { number: "1", assetpartdefinition: "spk" } },
            ],
          },
          {
            $: { "set-type": "fa" },
            frame: [
              { $: { number: "0", assetpartdefinition: "spk" } },
              { $: { number: "1", assetpartdefinition: "spk" } },
            ],
          },
        ],
      },
      {
        $: { id: "Swim" },
        part: [
          {
            $: { "set-type": "bds" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swm" } },
              { $: { number: "1", assetpartdefinition: "swm" } },
              { $: { number: "2", assetpartdefinition: "swm" } },
              { $: { number: "3", assetpartdefinition: "swm" } },
            ],
          },
          {
            $: { "set-type": "ss" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swm" } },
              { $: { number: "1", assetpartdefinition: "swm" } },
              { $: { number: "2", assetpartdefinition: "swm" } },
              { $: { number: "3", assetpartdefinition: "swm" } },
            ],
          },
          {
            $: { "set-type": "lhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swm" } },
              { $: { number: "1", assetpartdefinition: "swm" } },
              { $: { number: "2", assetpartdefinition: "swm" } },
              { $: { number: "3", assetpartdefinition: "swm" } },
            ],
          },
          {
            $: { "set-type": "rhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swm" } },
              { $: { number: "1", assetpartdefinition: "swm" } },
              { $: { number: "2", assetpartdefinition: "swm" } },
              { $: { number: "3", assetpartdefinition: "swm" } },
            ],
          },
        ],
      },
      {
        $: { id: "Float" },
        part: [
          {
            $: { "set-type": "bds" },
            frame: [
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "2", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "0", assetpartdefinition: "sws" } },
            ],
          },
          {
            $: { "set-type": "ss" },
            frame: [{ $: { number: "0", assetpartdefinition: "sws" } }],
          },
          {
            $: { "set-type": "lhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "sws" } },
              { $: { number: "0", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "2", assetpartdefinition: "sws" } },
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "2", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
            ],
          },
          {
            $: { "set-type": "rhs" },
            frame: [
              { $: { number: "0", assetpartdefinition: "sws" } },
              { $: { number: "0", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "2", assetpartdefinition: "sws" } },
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "3", assetpartdefinition: "sws" } },
              { $: { number: "2", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
              { $: { number: "1", assetpartdefinition: "sws" } },
            ],
          },
        ],
      },
      {
        $: { id: "Sign" },
        part: [
          {
            $: { "set-type": "lh" },
            frame: [{ $: { number: "0", assetpartdefinition: "sig" } }],
          },
          {
            $: { "set-type": "li" },
            frame: [{ $: { number: "0", assetpartdefinition: "sig" } }],
          },
          {
            $: { "set-type": "ls" },
            frame: [{ $: { number: "0", assetpartdefinition: "wav" } }],
          },
          {
            $: { "set-type": "lc" },
            frame: [{ $: { number: "0", assetpartdefinition: "wav" } }],
          },
        ],
      },
      {
        $: { id: "Respect" },
        part: [
          {
            $: { "set-type": "lh" },
            frame: [
              {
                $: {
                  number: "0",
                  assetpartdefinition: "respect",
                  repeats: "15",
                },
              },
              {
                $: {
                  number: "1",
                  assetpartdefinition: "respect",
                  repeats: "15",
                },
              },
            ],
          },
          {
            $: { "set-type": "ls" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav", repeats: "15" } },
              { $: { number: "1", assetpartdefinition: "wav", repeats: "15" } },
            ],
          },
          {
            $: { "set-type": "lc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "wav", repeats: "15" } },
              { $: { number: "1", assetpartdefinition: "wav", repeats: "15" } },
            ],
          },
        ],
      },
      {
        $: { id: "Blow" },
        part: [
          {
            $: { "set-type": "rh" },
            frame: [
              { $: { number: "0", assetpartdefinition: "blw", repeats: "10" } },
              { $: { number: "1", assetpartdefinition: "blw", repeats: "10" } },
            ],
          },
          {
            $: { "set-type": "rs" },
            frame: [{ $: { number: "0", assetpartdefinition: "drk" } }],
          },
          {
            $: { "set-type": "rc" },
            frame: [{ $: { number: "0", assetpartdefinition: "drk" } }],
          },
          {
            $: { "set-type": "ri" },
            frame: [{ $: { number: "0", assetpartdefinition: "" } }],
          },
          {
            $: { "set-type": "ey" },
            frame: [
              { $: { number: "0", assetpartdefinition: "std", repeats: "10" } },
              { $: { number: "0", assetpartdefinition: "eyb", repeats: "10" } },
            ],
          },
          {
            $: { "set-type": "fc" },
            frame: [
              { $: { number: "0", assetpartdefinition: "std", repeats: "10" } },
              { $: { number: "0", assetpartdefinition: "blw", repeats: "10" } },
            ],
          },
        ],
      },
      {
        $: { id: "Laugh" },
        part: [
          {
            $: { "set-type": "rh" },
            frame: [{ $: { number: "0", assetpartdefinition: "blw" } }],
          },
          {
            $: { "set-type": "rs" },
            frame: [{ $: { number: "0", assetpartdefinition: "drk" } }],
          },
          {
            $: { "set-type": "rc" },
            frame: [{ $: { number: "0", assetpartdefinition: "drk" } }],
          },
          {
            $: { "set-type": "ri" },
            frame: [{ $: { number: "0", assetpartdefinition: "" } }],
          },
          {
            $: { "set-type": "ey" },
            frame: [
              { $: { number: "0", assetpartdefinition: "std", repeats: "2" } },
            ],
          },
          {
            $: { "set-type": "fc" },
            frame: [{ $: { number: "0", assetpartdefinition: "sml" } }],
          },
        ],
        offsets: [
          {
            frame: [
              {
                $: { id: "0" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "1" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "3" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "5" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                      {
                        $: { id: "7" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "1" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "1" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "1" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "3" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "5" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                      {
                        $: { id: "7" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "0" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        $: { id: "SnowWarRun" },
        part: [
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "3", assetpartdefinition: "swrun" } },
              { $: { number: "2", assetpartdefinition: "swrun" } },
              { $: { number: "1", assetpartdefinition: "swrun" } },
              { $: { number: "0", assetpartdefinition: "swrun" } },
            ],
          },
        ],
      },
      {
        $: { id: "SnowWarDieFront" },
        part: [
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swdie" } },
              { $: { number: "0", assetpartdefinition: "swdie" } },
              { $: { number: "1", assetpartdefinition: "swdie" } },
              {
                $: {
                  number: "1",
                  assetpartdefinition: "swdie",
                  repeats: "100",
                },
              },
            ],
          },
        ],
        offsets: [
          {
            frame: [
              {
                $: { id: "0" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "4" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "4" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "1" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "4" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "4" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "2" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "3", repeats: "100" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        $: { id: "SnowWarDieBack" },
        part: [
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "2", assetpartdefinition: "swdie" } },
              { $: { number: "2", assetpartdefinition: "swdie" } },
              { $: { number: "3", assetpartdefinition: "swdie" } },
              {
                $: {
                  number: "3",
                  assetpartdefinition: "swdie",
                  repeats: "100",
                },
              },
            ],
          },
        ],
        offsets: [
          {
            frame: [
              {
                $: { id: "0" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "4" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "4" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "1" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "4" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-10", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "10", dy: "4" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "2" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                    ],
                  },
                ],
              },
              {
                $: { id: "3", repeats: "100" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "-100", dy: "5" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        $: { id: "SnowWarPick" },
        part: [
          {
            $: { "set-type": "ch" },
            frame: [{ $: { number: "0", assetpartdefinition: "swpick" } }],
          },
        ],
        offsets: [
          {
            frame: [
              {
                $: { id: "0" },
                directions: [
                  {
                    direction: [
                      {
                        $: { id: "0" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "1" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "2" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "3" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "4" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "5" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "6" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                      {
                        $: { id: "7" },
                        bodypart: [{ $: { id: "head", dx: "0", dy: "3" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        $: { id: "SnowWarThrow" },
        part: [
          {
            $: { "set-type": "ch" },
            frame: [
              { $: { number: "0", assetpartdefinition: "swthrow" } },
              { $: { number: "0", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              { $: { number: "1", assetpartdefinition: "swthrow" } },
              {
                $: {
                  number: "0",
                  assetpartdefinition: "swthrow",
                  repeats: "100",
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const avatarAnimations = new _AvatarAnimations();
