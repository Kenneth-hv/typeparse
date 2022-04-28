/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TypeParseError } from "./Error";
import {
  Static,
  TParseNumber,
  TParseString,
  TParseBoolean,
  TParseObject,
  TParseObjectProperties,
  TParseOption,
  TParseOptional,
  TParseRequired,
  TParseArray,
  TParseOptions,
  TParseAny,
  TParseUnion,
  ParseResult,
  TParseCustom,
  TParseCustomFunction,
} from "./Types";
import { get } from "./Utils";

export class TypeParse<T extends TParseOptions = TParseOptions> {
  private config: T;

  public constructor(parseConfig: T) {
    this.config = parseConfig;
  }

  public parse<B extends boolean = false>(
    input: unknown,
    config?: {
      safeParse?: B;
    }
  ): ParseResult<T, B> {
    try {
      const parsed = this._parse(input, this.config);
      if (config?.safeParse)
        return {
          success: true,
          data: parsed,
        };
      return parsed;
    } catch (error) {
      if (config?.safeParse) {
        return {
          success: false,
          error: error.toString(),
        };
      }
      throw error;
    }
  }

  private _parse(
    input: unknown,
    config: TParseOptions,
    relativePath?: string
  ): Static<T> {
    switch (config.as) {
      case "object":
        return this.parseObject(input, config, relativePath);
      case "array":
        return this.parseArray(input, config, relativePath);
      case "string":
        return this.parseString(input, config, relativePath);
      case "number":
        return this.parseNumber(input, config, relativePath);
      case "boolean":
        return this.parseBoolean(input, config, relativePath);
      case "union":
        return this.parseUnion(input, config, relativePath);
      case "custom":
        return this.parseCustom(input, config, relativePath);
      default:
        return this.parseAny(input, config, relativePath);
    }
  }

  private parseString(
    input: unknown,
    config: TParseString,
    relativePath?: string
  ): string | undefined {
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);

    if (typeof input === "string") return input;

    if (typeof input === "number" || typeof input === "boolean")
      return `${input}`;

    if (config.defaultValue !== undefined) {
      return config.defaultValue;
    } else if (config.isOptional) {
      return undefined;
    } else {
      throw new TypeParseError({
        expectedType: "string",
        typeFound: input,
        key: config.from ?? relativePath,
      });
    }
  }

  private parseNumber(
    input: unknown,
    config: TParseNumber,
    relativePath?: string
  ): number | undefined {
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);
    if (typeof input === "number") return input;

    if (typeof input === "string") {
      const result = Number.parseFloat(input);
      if (!isNaN(result)) {
        return result;
      }
    }

    if (config.defaultValue !== undefined) {
      return config.defaultValue;
    } else if (config.isOptional) {
      return undefined;
    } else {
      throw new TypeParseError({
        expectedType: "number",
        typeFound: input,
        key: config.from ?? relativePath,
      });
    }
  }

  private parseBoolean(
    input: unknown,
    config: TParseBoolean,
    relativePath?: string
  ): boolean | undefined {
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);
    if (typeof input === "boolean") return input;

    if (!config.strict && typeof input !== "undefined") return !!input;

    if (config.defaultValue !== undefined) {
      return config.defaultValue;
    } else if (config.isOptional) {
      return undefined;
    } else {
      throw new TypeParseError({
        expectedType: "boolean",
        typeFound: input,
        key: config.from ?? relativePath,
      });
    }
  }

  private parseAny(input: unknown, config: TParseAny, relativePath?: string) {
    if (typeof input !== "object") return input;
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);
    return input ?? config.defaultValue ?? input;
  }

  private parseCustom(
    input: unknown,
    config: TParseCustom<TParseCustomFunction<unknown>>,
    relativePath?: string
  ): unknown | undefined {
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);
    try {
      return config.parseFunction(input);
    } catch (error) {
      if (config.isOptional) {
        return undefined;
      } else {
        throw new TypeParseError({
          expectedType: "unknown",
          customError: error,
        });
      }
    }
  }

  private parseArray(
    input: unknown,
    config: TParseArray<TParseOption>,
    relativePath?: string
  ): Array<unknown> | undefined {
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);

    if (!Array.isArray(input)) {
      if (config.isOptional) return undefined;
      throw new TypeParseError({
        expectedType: "array",
        typeFound: input,
        key: config.from ?? relativePath,
      });
    }

    const results: Array<unknown> = [];

    input.forEach((element) => {
      const parsed = this._parse(element, config.type as TParseOptions);
      if (parsed !== undefined) results.push(parsed);
    });

    return results;
  }

  private parseObject(
    input: unknown,
    config: TParseObject<TParseObjectProperties>,
    relativePath?: string
  ): object | undefined {
    if (config.from) relativePath = config.from;

    if (typeof input !== "object") {
      if (config.isOptional) return undefined;
      throw new TypeParseError({
        expectedType: "object",
        typeFound: input,
        key: relativePath,
      });
    }

    const result: { [key: string]: unknown } = {};
    try {
      Object.entries(config.properties).forEach(([key, value]) => {
        result[key] = this._parse(
          input,
          value,
          relativePath ? `${relativePath}.${key}` : key
        );
      });
    } catch (error) {
      if (config.isOptional) return undefined;
      throw error;
    }
    return result;
  }

  private parseUnion(
    input: unknown,
    config: TParseUnion<TParseOption[]>,
    relativePath?: string
  ): unknown {
    for (const value of config.types) {
      try {
        return this._parse(input, value as TParseOptions, relativePath);
      } catch {
        continue;
      }
    }
    if (config.isOptional) {
      return undefined;
    } else {
      throw new Error("Cannot parse to match any type of union");
    }
  }
}

const optional = <T extends TParseOption>(option: T): TParseOptional<T> => {
  return {
    ...option,
    isOptional: true,
    optional: undefined,
  };
};

export const Types = {
  String: (config?: {
    defaultValue?: string;
    path?: string;
  }): TParseRequired<TParseString> => {
    return {
      $static: undefined as never,
      as: "string",
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from: config?.path,
    };
  },
  Number: (config?: {
    defaultValue?: number;
    path?: string;
  }): TParseRequired<TParseNumber> => {
    return {
      $static: undefined as never,
      as: "number",
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from: config?.path,
    };
  },
  Boolean: (config?: {
    defaultValue?: boolean;
    path?: string;
    strict?: boolean;
  }): TParseRequired<TParseBoolean> => {
    return {
      $static: undefined as never,
      as: "boolean",
      defaultValue: config?.defaultValue,
      strict: config?.strict !== undefined ? config.strict : true,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from: config?.path,
    };
  },
  Any: (config?: { defaultValue?: unknown; path?: string }): TParseAny => {
    return {
      $static: undefined as never,
      as: "any",
      isOptional: false,
      from: config?.path,
      defaultValue: config?.defaultValue,
    };
  },
  Array: <T extends TParseOption>(
    type: T,
    config?: {
      path?: string;
    }
  ): TParseRequired<TParseArray<T>> => {
    return {
      $static: undefined as never,
      as: "array",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from: config?.path,
      type,
    };
  },
  Object: <T extends TParseObjectProperties>(
    properties: T,
    config?: {
      path?: string;
    }
  ): TParseRequired<TParseObject<T>> => {
    return {
      $static: undefined as never,
      as: "object",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      properties,
      from: config?.path,
    };
  },
  Union: <T extends TParseOption[]>(
    types: T
  ): TParseRequired<TParseUnion<T>> => {
    return {
      $static: undefined as never,
      as: "union",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      types,
    };
  },
  Custom: <Func extends TParseCustomFunction>(
    func: Func,
    config?: {
      defaultValue?: boolean;
      path?: string;
    }
  ): TParseRequired<TParseCustom<Func>> => {
    return {
      $static: undefined as never,
      as: "custom",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      parseFunction: func,
      from: config?.path,
    };
  },
};
