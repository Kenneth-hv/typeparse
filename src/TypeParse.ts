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
} from "./Types";
import { get, isNaN } from "lodash";

export class TypeParse<T extends TParseOptions = TParseOptions> {
  private config: T;

  public constructor(parseConfig: T) {
    this.config = parseConfig;
  }

  public parse(input: unknown, optionalOption?: TParseOptions): Static<T> {
    const option = optionalOption ?? this.config;

    if (option.as === "object") {
      return this.parseObject(input, option);
    }

    if (option.as === "array") {
      return this.parseArray(input, option);
    }

    if (option.from) input = get(input, option.from);

    if (option.as === "string") {
      return this.parseString(input, option);
    } else if (option.as === "number") {
      return this.parseNumber(input, option);
    } else {
      return this.parseBoolean(input, option);
    }
  }

  private parseString(
    input: unknown,
    option: TParseString
  ): string | undefined {
    if (typeof input === "string") return input;

    if (typeof input === "number" || typeof input === "boolean")
      return `${input}`;

    if (option.defaultValue !== undefined) {
      return option.defaultValue;
    } else if (option.isOptional) {
      return undefined;
    } else {
      throw Error("Cannot parse string");
    }
  }

  private parseNumber(
    input: unknown,
    option: TParseNumber
  ): number | undefined {
    if (typeof input === "number") return input;

    if (typeof input === "string") {
      const result = Number.parseFloat(input);
      if (!isNaN(result)) {
        return result;
      }
    }

    if (option.defaultValue !== undefined) {
      return option.defaultValue;
    } else if (option.isOptional) {
      return undefined;
    } else {
      throw Error("Cannot parse number");
    }
  }

  private parseBoolean(
    input: unknown,
    option: TParseBoolean
  ): boolean | undefined {
    if (typeof input === "boolean") return input;

    if (!option.strict && typeof input !== "undefined") return !!input;

    if (option.defaultValue !== undefined) {
      return option.defaultValue;
    } else if (option.isOptional) {
      return undefined;
    } else {
      throw Error("Cannot parse boolean");
    }
  }

  private parseArray(
    input: unknown,
    option: TParseArray<TParseOption>
  ): Array<unknown> | undefined {
    if (option.from) input = get(input, option.from);

    if (!Array.isArray(input)) {
      if (option.isOptional) return undefined;
      throw Error("Is not array");
    }

    const results: Array<unknown> = [];

    input.forEach((element) => {
      const parsed = this.parse(element, option.type as TParseOptions);
      if (parsed !== undefined) results.push(parsed);
    });

    return results;
  }

  private parseObject(
    input: unknown,
    option: TParseObject<TParseObjectProperties>
  ): object | undefined {
    if (typeof input !== "object") {
      if (option.isOptional) return undefined;
      throw Error("Is not object");
    }
    const result: { [key: string]: unknown } = {};

    Object.entries(option.properties).forEach(([key, value]) => {
      result[key] = this.parse(input, value);
    });

    return result;
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
      $static: "string",
      as: "string",
      from,
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
    };
  },
  Number: (
    from?: string,
    config?: {
      defaultValue?: number;
    }
  ): TParseRequired<TParseNumber> => {
    return {
      $static: 0,
      as: "number",
      from,
      defaultValue: config?.defaultValue,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
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
      $static: true,
      as: "boolean",
      from,
      defaultValue: config?.defaultValue,
      strict: config?.strict !== undefined ? config.strict : true,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
    };
  },
  Array: <T extends TParseOption>(
    type: T,
    from?: string
  ): TParseRequired<TParseArray<T>> => {
    return {
      $static: [],
      as: "array",
      from,
      type,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
    };
  },
  Object: <T extends TParseObjectProperties>(
    properties: T
  ): TParseRequired<TParseObject<T>> => {
    return {
      $static: 0 as any,
      as: "object",
      properties,
      isOptional: false,
      optional: function () {
        return optional(this);
      },
    };
  },
};
