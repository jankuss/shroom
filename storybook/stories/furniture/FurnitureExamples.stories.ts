import { renderFurnitureExample } from "./renderFurnitureExample";

export default {
  title: "Furniture / Examples",
};

export function ClubSofa() {
  return renderFurnitureExample("club_sofa", {
    directions: [0, 2, 4, 6],
    spacing: 3,
  });
}

export function DragonLamp0() {
  return renderFurnitureExample("rare_dragonlamp*0", {
    directions: [2, 4],
    spacing: 3,
    animations: ["0", "1"],
  });
}

export function DragonLamp1() {
  return renderFurnitureExample("rare_dragonlamp*1", {
    directions: [2, 4],
    spacing: 3,
    animations: ["0", "1"],
  });
}

export function GuildGate() {
  return renderFurnitureExample("gld_gate", {
    directions: [2, 4],
    spacing: 3,
    animations: ["0", "1"],
  });
}

export function RareDaffodilRug() {
  return renderFurnitureExample("rare_daffodil_rug", {
    directions: [0, 2, 4, 6],
    spacing: 3,
  });
}
