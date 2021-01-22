import { AvatarAction, BaseAvatar } from "@jankuss/shroom";
import { TestRenderer } from "../../TestRenderer";

export const renderBasicAvatars: TestRenderer = ({ shroom, application }) => {
  const looks = [
    "hd-180-1.hr-3322-34.ch-215-92.cc-3075-62.lg-3407-110.sh-908-1419",
    "hd-605-2.hr-3012-47.ch-645-1430.lg-720-63.sh-725-92.wa-2001-62",
    "hd-209-3.hr-3021-39.he-3324-1336.ch-3109-99.cp-3286-94.lg-3391-110.sh-3016-110",
    "hd-3098-1.hr-681-61.ch-822-110.lg-3408-110.sh-735-62",
    "hd-628-2.hr-890-55.fa-1203-110.ch-3135-66.cc-3157-1328.lg-3174-1327.sh-3419-110",
    "hd-3093-1.hr-3278-35.fa-1209-1410.ch-255-110.lg-3116-96.sh-295-92",
    "hd-3093-17.hr-155-60.ea-1404-62.ch-3323-110.ca-3175-62.lg-281-110.sh-305-62",
    "hd-205-1.hr-155-61.ea-1406-107.ch-262-107.lg-280-110.sh-305-62",
    "hd-3103-1.hr-155-61.ch-3234-99.cc-3360-110.cp-3310-1410.lg-3328-110.sh-3252-63.wa-2002-107",
  ];

  const looks2 = [
    "hd-190-3.hr-3163-61.fa-1206-110.ch-210-92.cc-3075-110.lg-3058-110.sh-290-92",
    "hd-3102-10.hr-828-61.ha-1013-67.he-1601-62.fa-1201-62.ch-230-92.ca-1804-67.lg-275-67",
    "hd-190-3.hr-3163-61.ha-3291-100.fa-3344-110.ch-3215-92.cc-3152-110.lg-3418-110.sh-290-63",
    "hd-209-1.hr-3163-34.ch-220-64.lg-3023-110.sh-290-62",
    "hd-190-10.hr-3163-61.ha-1006-110.he-1608-62.fa-1201-62.ch-210-92.lg-275-110.sh-290-62",
    "hd-3092-1.ha-1002-110.ea-3141-62.ch-210-92.cc-3158-1340.lg-3058-110.sh-3068-62",
    "hd-3092-1.hr-828-1355.ch-210-1340.cc-887-1340.lg-280-110.sh-3068-62",
    "hd-180-1.hr-3325-49.ha-3026-110.he-3082-1425.ea-3107-1408.fa-1212-62.ch-3030-1408.ca-3292-109.lg-3320-109.sh-3016-62.wa-3073-62",
    "hd-180-1.hr-100-1406.he-3385-88.ea-3388-88.fa-3378-88.cc-3294-88.lg-3023-88.sh-3115-88.wa-3072-73",
  ];

  const renderLooks = (looks: string[], x: number) => {
    for (let i = 0; i < looks.length; i++) {
      const y = 100 + i * 100;
      const look = looks[i];
      const actions = new Set<AvatarAction>([AvatarAction.Default]);

      for (let d = 0; d < 8; d++) {
        const avatar = BaseAvatar.fromShroom(shroom, {
          look: { look, actions, direction: d },
          position: { x: x + d * 64, y: y },
          zIndex: 0,
        });

        application.stage.addChild(avatar);
      }
    }
  };

  renderLooks(looks, 0);
  renderLooks(looks2, 64 * 8);
};
