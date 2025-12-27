export const extractPaths = ({ obj, prefix = "", result = [] }: { obj: any, prefix?: string, result?: any }) => {
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      extractPaths({ obj: obj[key], prefix: path, result });
    } else {
      result.push({
        path,
        value: obj[key],
        type: Array.isArray(obj[key]) ? "array" : typeof obj[key]
      });
    }
  }
  return result;
}
