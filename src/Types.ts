/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


// ----------------------------------------------------------------------------
//  Parse options
// ----------------------------------------------------------------------------

/**
 * Base parse option.
 */
export interface TParseOption {
  $static: unknown;
  from?: string;
  as: string;
  isOptional: boolean;
}

export type TParseRequired<T extends TParseOption> = T & {
  isOptional: false;
  optional: () => TParseOptional<T>;
};

export type TParseOptional<T extends TParseOption> = T & {
  isOptional: true;
};

export interface TParseString extends TParseOption {
  $static: string;
  from?: string;
  as: "string";
  defaultValue?: string;
}

export interface TParseNumber extends TParseOption {
  $static: number;
  from?: string;
  as: "number";
  defaultValue?: number;
}

export interface TParseBoolean extends TParseOption {
  $static: boolean;
  from?: string;
  as: "boolean";
  strict: boolean;
  defaultValue?: boolean;
}

export interface TParseObject<T extends TParseObjectProperties>
  extends TParseOption {
  //@ts-ignore Temporary fix for: "'$static' is referenced directly or indirectly in its own type annotation."
  $static: SObject<T>;
  as: "object";
  properties: T;
}

export interface TParseArray<T extends TParseOption> extends TParseOption {
  $static: Array<Static<T>>;
  as: "array";
  from?: string;
  type: T;
}

export interface TParseObjectProperties {
  [key: string]: TParseOptions;
}

// ----------------------------------------------------------------------------
//  Static types
// ----------------------------------------------------------------------------

export type SObjectOptionalPropertyKeys<T extends TParseObjectProperties> = {
  [K in keyof T]: T[K] extends TParseOptional<TParseOption> ? K : never;
}[keyof T];

export type SObjectRequiredPropertyKeys<T extends TParseObjectProperties> =
  keyof Omit<T, SObjectOptionalPropertyKeys<T>>;

export type SObjectProperties<T extends TParseObjectProperties> = {
  [I in SObjectRequiredPropertyKeys<T>]: Static<T[I]>;
} & {
  [I in SObjectOptionalPropertyKeys<T>]?: Static<T[I]>;
};

// export type SArray<T extends TParseSchema> = Array<Static<T>>;

export type SObject<T extends TParseObjectProperties> =
  SObjectProperties<T> extends infer I
    ? {
        [K in keyof I]: I[K];
      }
    : never;

export type Static<T extends TParseOption> = T["$static"];

export type TParseOptions =
  | TParseString
  | TParseNumber
  | TParseBoolean
  | TParseArray<TParseOption>
  | TParseObject<TParseObjectProperties>;
