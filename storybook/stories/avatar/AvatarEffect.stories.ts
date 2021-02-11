import { Room, Avatar } from "@jankuss/shroom";
import { renderAvatarDirections } from "./renderAvatarDirections";

export default {
  title: "Avatar / Effects",
};

function renderEffect(effect: string) {
  return renderAvatarDirections(
    "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
    (avatar) => {
      avatar.effect = effect;
    }
  );
}

export function Dance1() {
  return renderEffect("dance.1");
}

export function Dance2() {
  return renderEffect("dance.2");
}

export function Dance3() {
  return renderEffect("dance.3");
}

export function Dance4() {
  return renderEffect("dance.4");
}

export function Spotlight() {
  return renderEffect("1");
}

export function Hoverboard() {
  return renderEffect("2");
}

export function UFO() {
  return renderEffect("3");
}
