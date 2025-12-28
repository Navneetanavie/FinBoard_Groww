import { DisplayMode } from "./constants";
import type { WidgetFormState } from "./types";

const isNumber = (value: string) => {
  return !isNaN(Number(value));
}

const getType = (value: string) => {
  return (typeof value === "string" && value.trim().length > 0) && isNumber(value) ? "number" : typeof value;
}

export const extractPaths = ({ obj, prefix = "", result = [] }: { obj: any, prefix?: string, result?: any }) => {
  for (const key in obj) {
    const path = prefix ? `${prefix}=>${key}` : key;
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      extractPaths({ obj: obj[key], prefix: path, result });
    } else if (Array.isArray(obj[key]) && obj[key].length === 1) {
      extractPaths({ obj: obj[key][0], prefix: path, result });
    } else {
      result.push({
        path,
        type: getType(obj[key])
      });
    }
  }
  return result;
}

export const findHomogeneousField = ({ obj, currentPath = '' }: { obj: any, currentPath?: string }): { path: string, obj: any } | null => {
  if (typeof obj !== 'object' || obj === null) return null;

  // Check if this is homogeneous (all values have same keys)
  const values = Object.values(obj);
  if (values.length > 1 && values.every(v =>
    v && typeof v === 'object' &&
    Object.keys(v).every(k => Object.keys(values[0] as object).includes(k))
  )) {
    return { path: currentPath, obj };
  }

  // Recurse into nested objects/arrays
  for (const [key, value] of Object.entries(obj)) {
    const path = currentPath ? `${currentPath}=>${key}` : key;
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const result = findHomogeneousField({ obj: value, currentPath: path });
      if (result) return result;
    }
  }
  return null;
}

export const findArrayField = ({ obj, currentPath = '' }: { obj: any, currentPath?: string }): { path: string, array: any[] } | null => {
  if (typeof obj !== 'object' || obj === null) return null;
  // Recurse into nested objects/arrays
  for (const [key, value] of Object.entries(obj)) {
    const path = currentPath ? `${currentPath}=>${key}` : key;
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const result = findArrayField({ obj: value, currentPath: path });
      if (result) return result;
    }
    if (Array.isArray(obj[key]) && typeof obj[key][0] === "object") {
      return { path: currentPath ? `${currentPath}.${key}` : key, array: obj[key] };
    }
  }
  return null;
}

export const getSelectableFields = ({ data, widgetType }: { data: any, widgetType: DisplayMode }) => {
  if (widgetType === DisplayMode.CARD) {
    return {
      selectableFields: extractPaths({ obj: data })
    };
  }

  const homogeneousField = findHomogeneousField({ obj: data });
  if (homogeneousField) {
    const { path, obj } = homogeneousField;
    return {
      selectableFields: Object.keys(obj[Object.keys(obj)[0]]).map((key) => ({
        path: `${path}=>${key}`,
        type: getType(obj[Object.keys(obj)[0]][key])
      })),
      path,
      isKeyDefined: true
    };
  }

  const arrayField = findArrayField({ obj: data });
  if (arrayField) {
    const { path, array } = arrayField;
    return {
      selectableFields: Object.keys(array[0]).map((key) => ({
        path: `${path}=>${key}`,
        type: getType(array[0][key])
      })),
      path,
      isKeyDefined: false
    };
  }
}

export const getValueByPath = (obj: any, path: string) => {
  if (!obj) return null;
  return path.split('=>').reduce((acc, part) => acc && acc[part], obj);
}

export const getRelativePath = (fullPath: string, rootPath: string) => {
  if (!rootPath) return fullPath;
  if (fullPath.startsWith(rootPath + '=>')) {
    return fullPath.slice(rootPath.length + 2);
  }
  return fullPath;
}

export const getDataWithAllowedField = (data: any[], allowedFields: string[]) => {
  return data?.map((item) => Object.fromEntries(
    Object.entries(item).filter(([key]) => allowedFields.includes(key))
  )) || [];
}

export const getTableData = ({ widgetData, fetchedData }: { widgetData: WidgetFormState, fetchedData: any }): { columnKeys: { label: string, key: string }[], tableValues: { [key: string]: any }[] } => {
  const path = widgetData.dataKey.split("=>").slice(0, -1).join("=>");
  let rootValue = getValueByPath(fetchedData, path);
  const dataKeyField = widgetData.dataKey.split("=>").pop()!;
  const columnKeys = [
    { label: widgetData.dataKeyLabel ?? widgetData.dataKey, key: dataKeyField },
    ...widgetData.fields.map((field) => ({ label: field.label ?? field.path, key: field.path.split("=>").pop()! }))];
  if (!Array.isArray(rootValue)) {
    const homogeneousValue = getValueByPath(fetchedData, widgetData.dataKey);
    if (homogeneousValue && !Array.isArray(homogeneousValue) && typeof homogeneousValue === "object") {
      rootValue = Object.keys(homogeneousValue).map((key) => ({
        [dataKeyField]: key,
        ...homogeneousValue[key]
      }))
    }
  }
  const filteredTableValues = getDataWithAllowedField(rootValue, columnKeys.map((col) => col.key));
  return {
    columnKeys,
    tableValues: filteredTableValues
  };
}
