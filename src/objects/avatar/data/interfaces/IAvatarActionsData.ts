import { AvatarAction } from "../../enum/AvatarAction";

export interface IAvatarActionsData {
  getAction(id: AvatarAction): AvatarActionInfo | undefined;
  getActions(): AvatarActionInfo[];
  getHandItemId(actionId: string, id: string): number | undefined;
}

export interface AvatarActionInfo {
  id: string;
  state: string;
  precedence: number;
  geometrytype: string;
  activepartset: string | null;
  assetpartdefinition: string;
  prevents: string[];
  animation: boolean;
  main: boolean;
  isdefault: boolean;
}
