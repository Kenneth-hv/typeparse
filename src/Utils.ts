/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const ARRAY_INDEX_SYNTAX = /^\[(-?\d+)\]$|^((?!\\\[).+)|\\(.+)$/;
// const ARRAY_FOR_EACH_SYNTAX = /^(.+)\[\]$/; TODO

interface AObject {
  [key: string]: unknown;
}

function accessPath(input: unknown, path: string[]): unknown {
  const key = path.shift();
  if (!key) return input;
  if (!input) return undefined;
  if (typeof input !== "object") return undefined;

  const match = ARRAY_INDEX_SYNTAX.exec(key);
  if (!match) return undefined;
  const arrayKey = match[1] ? Number.parseInt(match[1]) : undefined;

  if (arrayKey !== undefined) {
    if (!Array.isArray(input)) return undefined;
    if (arrayKey < 0) return accessPath(input[input.length + arrayKey], path);
    return accessPath(input[arrayKey], path);
  }
  return accessPath((input as AObject)[match[2] ?? match[3]], path);
}

export function get(input: unknown, path?: string): unknown {
  if (!path) return input;
  if (typeof input !== "object") return undefined;
  return accessPath(input, path.split("."));
}
