/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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
} from "./Types";
import { get } from "./Utils";

export class TypeParse<T extends TParseOptions = TParseOptions> {
  private config: T;

  public constructor(parseConfig: T) {
    this.config = parseConfig;
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
      default:
        return this.parseAny(input, config, relativePath);
    }
  }

  public parse(input: unknown) {
    return this._parse(input, this.config);
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
      throw Error("Cannot parse string");
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
      throw Error("Cannot parse number");
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
      throw Error("Cannot parse boolean");
    }
  }

  private parseAny(input: unknown, config: TParseAny, relativePath?: string) {
    if (typeof input !== "object") return input;
    if (config.from) input = get(input, config.from);
    else input = get(input, relativePath);
    return input;
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
      throw Error("Is not array");
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
    if (typeof input !== "object") {
      if (config.isOptional) return undefined;
      throw Error("Is not object");
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
  String: (
    from?: string,
    config?: {
      defaultValue?: string;
    }
  ): TParseRequired<TParseString> => {
    return {
      $static: undefined as never,
      as: "string",
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from,
    };
  },
  Number: (
    from?: string,
    config?: {
      defaultValue?: number;
    }
  ): TParseRequired<TParseNumber> => {
    return {
      $static: undefined as never,
      as: "number",
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from,
    };
  },
  Boolean: (
    from?: string,
    config?: {
      defaultValue?: boolean;
      strict?: boolean;
    }
  ): TParseRequired<TParseBoolean> => {
    return {
      $static: undefined as never,
      as: "boolean",
      defaultValue: config?.defaultValue,
      strict: config?.strict !== undefined ? config.strict : true,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from,
    };
  },
  Any: (
    from?: string,
    config?: {
      defaultValue?: boolean;
    }
  ): TParseRequired<TParseAny> => {
    return {
      $static: undefined as never,
      as: "any",
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from,
    };
  },
  Array: <T extends TParseOption>(
    type: T,
    from?: string
  ): TParseRequired<TParseArray<T>> => {
    return {
      $static: undefined as never,
      as: "array",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      from,
      type,
    };
  },
  Object: <T extends TParseObjectProperties>(
    properties: T
  ): TParseRequired<TParseObject<T>> => {
    return {
      $static: undefined as never,
      as: "object",
      isOptional: false,
      optional: function () {
        return optional(this);
      },
      properties,
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
};
