import { default as Ajv, Options as AjvOptions } from "ajv";

export function createAjv(options: AjvOptions) {
  const ajv = new Ajv(options);
  ajv.removeKeyword("layout");
  ajv.addKeyword("layout");
  return ajv;
}
