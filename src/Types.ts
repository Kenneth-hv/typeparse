/*------------------------------------------------------------------------------

  TypeParse: 
  Runtime object parsing and validation with static TypeScript typing.

  Copyright 2022 Kenneth Herrera <kfhv.24@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

------------------------------------------------------------------------------*/

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
