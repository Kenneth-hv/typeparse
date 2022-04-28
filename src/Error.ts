/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export type ExpectedType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "array"
  | "unknown";

export enum TypeParseErrorCode {
  NOT_FOUND = "NOT_FOUND",
  INVALID_TYPE = "INVALID_TYPE",
  UNABLE_TO_PARSE = "UNABLE_TO_PARSE",
}

export interface TypeParseErrorDetails {
  expectedType?: ExpectedType;
  typeFound?: unknown;
  key?: string | string[];
  customError?: string;
}

export function typeOf(value: unknown): ExpectedType {
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export class TypeParseError implements Error {
  public readonly code: TypeParseErrorCode;
  public readonly name: string;
  public readonly message: string;

  public constructor(parameters: TypeParseErrorDetails) {
    const { expectedType, key, typeFound } = {
      ...parameters,
      typeFound: typeOf(parameters.typeFound),
    };
    this.name = "TypeParse exception";
    if (expectedType === "unknown") {
      this.code = TypeParseErrorCode.UNABLE_TO_PARSE;
      this.message = `${parameters.customError}`;
    } else if (typeFound === "undefined") {
      this.code = TypeParseErrorCode.NOT_FOUND;
      if (key) {
        this.message = `Unable to find a valid [${expectedType}] value at [${key}]`;
      } else {
        this.message = `Invalid type, expected [${expectedType}] but found [${typeFound}]`;
      }
    } else {
      this.code = TypeParseErrorCode.UNABLE_TO_PARSE;
      this.message = `Unable to convert [${typeFound}] to [${expectedType}]`;
    }
  }

  public toString() {
    return `TypeParse error: ${this.message}`;
  }
}
