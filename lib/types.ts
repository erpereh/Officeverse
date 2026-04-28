export type AssetCategory =
  | "character"
  | "floor"
  | "wall"
  | "furniture"
  | "interactive";

export type AssetDefinition = {
  key: string;
  name: string;
  category: AssetCategory;
  src: string;
  frame?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gridSize?: {
    w: number;
    h: number;
  };
  collidable?: boolean;
  interactive?: boolean;
};

export type AvatarDefinition = {
  id: string;
  name: string;
  src: string;
  frame: {
    width: number;
    height: number;
  };
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Office = {
  id: string;
  user_id: string;
  name: string;
  width: number;
  height: number;
  base_floor: string;
  created_at: string;
  updated_at: string;
};

export type OfficeObject = {
  id?: string;
  office_id: string;
  user_id: string;
  object_type: string;
  asset_key: string;
  x: number;
  y: number;
  rotation: number;
  layer: number;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type OfficeState = {
  profile: Profile;
  office: Office;
  objects: OfficeObject[];
};
