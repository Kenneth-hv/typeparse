/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const INDEX_SYNTAX_RE = /^\[(-?\d+)\]$|^((?!\\\[).+)|\\(.+)$/;

interface AObject {
  [key: string]: unknown;
}

function accessPath(input: unknown, path: string[]): unknown {
  const key = path.shift();
  if (key === undefined) return input;
  if (!input) return undefined;
  if (typeof input !== "object") return undefined;

  const match = INDEX_SYNTAX_RE.exec(key);
  const arrayKey = match?.[1] ? Number.parseInt(match[1]) : undefined;

  if (arrayKey !== undefined) {
    if (!Array.isArray(input)) return undefined;
    if (arrayKey < 0) return accessPath(input[input.length + arrayKey], path);
    return accessPath(input[arrayKey], path);
  }
  return accessPath((input as AObject)[match?.[2] ?? match?.[3] ?? ""], path);
}

export function get(input: unknown, path?: string): unknown {
  if (path === undefined) return input;
  return accessPath(input, path.split("."));
}
