import { WidgetEntity } from "./types";

export enum DisplayMode {
  TABLE = "table",
  CHART = "chart",
  CARD = "card"
}

export enum Fields {
  NAME = "name",
  URL = "url",
  REFRESH_INTERVAL = "refreshInterval",
  DISPLAY_MODE = "displayMode",
  FIELDS = "fields",
  DATA_KEY = "dataKey",
  DATA_KEY_LABEL = "dataKeyLabel"
}

export const initialData = {
  [Fields.NAME]: "",
  [Fields.URL]: "",
  [Fields.REFRESH_INTERVAL]: 0,
  [Fields.DISPLAY_MODE]: DisplayMode.CARD,
  [Fields.FIELDS]: [],
  [Fields.DATA_KEY]: "",
  [Fields.DATA_KEY_LABEL]: ""
} as WidgetEntity;
