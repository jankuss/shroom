import { TestMap } from "./TestMap";
import { renderBasicAvatars } from "./tests/avatar/renderBasicAvatars";
import { renderModelA } from "./tests/room/renderModelA";
import { renderModelB } from "./tests/room/renderModelB";
import { renderModelC } from "./tests/room/renderModelC";
import { renderModelD } from "./tests/room/renderModelD";
import { renderModelE } from "./tests/room/renderModelE";
import { renderModelF } from "./tests/room/renderModelF";
import { renderModelG } from "./tests/room/renderModelG";
import { renderModelH } from "./tests/room/renderModelH";
import { renderModelI } from "./tests/room/renderModelI";
import { renderModelJ } from "./tests/room/renderModelJ";
import { renderModelK } from "./tests/room/renderModelK";
import { renderModelL } from "./tests/room/renderModelL";
import { renderModelM } from "./tests/room/renderModelM";
import { renderModelN } from "./tests/room/renderModelN";
import { renderModelO } from "./tests/room/renderModelO";
import { renderModelP } from "./tests/room/renderModelP";
import { renderModelQ } from "./tests/room/renderModelQ";
import { renderModelR } from "./tests/room/renderModelR";

export const tests: TestMap = {
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
  "Avatar Rendering": {
    "Basic Avatars": renderBasicAvatars,
  },
};
