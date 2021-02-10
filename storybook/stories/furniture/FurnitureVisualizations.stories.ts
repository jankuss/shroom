import {
  BasicFurnitureVisualization,
  FurnitureGuildCustomizedVisualization,
} from "../../../dist";
import { renderFurnitureExample } from "./renderFurnitureExample";

export default {
  title: "Furniture / Visualizations",
};

export function StaticVisualization() {
  return renderFurnitureExample(
    "rare_dragonlamp*0",
    { directions: [2, 4], spacing: 2, animations: ["1"] },
    (furniture) => {
      furniture.visualization = new BasicFurnitureVisualization();
    }
  );
}

export function GuildVisualization() {
  return renderFurnitureExample(
    "gld_gate",
    { directions: [2, 4], spacing: 2 },
    (furniture) => {
      furniture.visualization = new FurnitureGuildCustomizedVisualization({
        primaryColor: "#ff00ff",
        secondaryColor: "#00ff00",
      });
    }
  );
}
