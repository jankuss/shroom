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
  ];

  for (let i = 0; i < looks.length; i++) {
    const y = i * 130;
    const look = looks[i];
    const actions = new Set<AvatarAction>([AvatarAction.Default]);

    for (let d = 0; d < 8; d++) {
      const avatar = BaseAvatar.fromShroom(shroom, {
        look: { look, actions, direction: d },
        position: { x: d * 64, y: y },
        zIndex: 0,
      });

      application.stage.addChild(avatar);
    }
  }
};
