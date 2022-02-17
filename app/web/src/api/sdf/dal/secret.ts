// import {StandardModel} from "@/api/sdf/dal/standard_model";

// FIXME(nick): remove "id" field once Secret extends standard model. If it will ultimately not extend standard model,
// then we should remove "id" and use name for key-ing through "Secret[]" objects.
export interface Secret {
  id: number;
  name: string;
  kind: string;
  objectType: string;
}

export interface SecretKind {
  name: string;
  type: string;
  fields?: SecretField[];
}

export interface SecretField {
  name: string;
  password: boolean;
}