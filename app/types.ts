import { DisplayMode, Fields } from "./constants";

export type selectedField = {
  path: string;
  value: any;
  type: string;
  label?: string;
}

export type WidgetEntity = {
  id?: string;
  [Fields.NAME]: string;
  [Fields.URL]: string;
  [Fields.REFRESH_INTERVAL]: number;
  [Fields.DISPLAY_MODE]: DisplayMode;
  [Fields.FIELDS]: selectedField[];
  [Fields.DATA_KEY]: string;
  [Fields.DATA_KEY_LABEL]: string;
}

export type WidgetFormAction = {
  type: 'UPDATE_FIELD';
  field: string;
  value: any;
};

export interface Option {
  label: string;
  value: string;
  type?: string;
}
