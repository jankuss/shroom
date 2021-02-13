import { AvatarAction } from "../../../dist";
import { renderAvatarDirections } from "./renderAvatarDirections";

export default {
  title: "Avatar / Actions",
};

export function Wave() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.Wave);
    }
  );
}

export function Respect() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.Respect);
    }
  );
}

export function Laugh() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.Laugh);
    }
  );
}

export function Smile() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.GestureSmile);
    }
  );
}

export function CarryItem() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.CarryItem);
      avatar.item = "1";
    }
  );
}

export function UseItem() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.UseItem);
      avatar.item = "1";
    }
  );
}

export function Sit() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.Sit);
      avatar.item = "1";
    }
  );
}

export function MultipleActions() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    undefined,
    (avatar) => {
      avatar.addAction(AvatarAction.Wave);
      avatar.addAction(AvatarAction.UseItem);
      avatar.addAction(AvatarAction.Sit);
      avatar.item = "1";
    }
  );
}

export function Lay() {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.ch-255-66.lg-280-110.sh-305-62",
    [2, 4],
    (avatar) => {
      avatar.addAction(AvatarAction.Lay);
    }
  );
}
