import { TestMap } from "./TestMap";
import { renderBasicAvatars } from "./tests/avatar/renderBasicAvatars";
import { renderModelA } from "./tests/room/models/renderModelA";
import { renderModelB } from "./tests/room/models/renderModelB";
import { renderModelC } from "./tests/room/models/renderModelC";
import { renderModelD } from "./tests/room/models/renderModelD";
import { renderModelE } from "./tests/room/models/renderModelE";
import { renderModelF } from "./tests/room/models/renderModelF";
import { renderModelG } from "./tests/room/models/renderModelG";
import { renderModelH } from "./tests/room/models/renderModelH";
import { renderModelI } from "./tests/room/models/renderModelI";
import { renderModelJ } from "./tests/room/models/renderModelJ";
import { renderModelK } from "./tests/room/models/renderModelK";
import { renderModelL } from "./tests/room/models/renderModelL";
import { renderModelM } from "./tests/room/models/renderModelM";
import { renderModelN } from "./tests/room/models/renderModelN";
import { renderModelO } from "./tests/room/models/renderModelO";
import { renderModelP } from "./tests/room/models/renderModelP";
import { renderModelQ } from "./tests/room/models/renderModelQ";
import { renderModelR } from "./tests/room/models/renderModelR";
import { renderHiddenWalls } from "./tests/room/renderHiddenWalls";

export const tests: TestMap = {
  Room: {
    "Room Models": {
      model_a: renderModelA,
      model_b: renderModelB,
      model_c: renderModelC,
      model_d: renderModelD,
      model_e: renderModelE,
      model_f: renderModelF,
      model_g: renderModelG,
      model_h: renderModelH,
      model_i: renderModelI,
      model_j: renderModelJ,
      model_k: renderModelK,
      model_l: renderModelL,
      model_m: renderModelM,
      model_n: renderModelN,
      model_o: renderModelO,
      model_p: renderModelP,
      model_q: renderModelQ,
      model_r: renderModelR,
    },
    "Hidden Walls": renderHiddenWalls,
  },
  "Avatar Rendering": {
    "Basic Avatars": renderBasicAvatars,
  },
};
