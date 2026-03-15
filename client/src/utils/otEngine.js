// src/utils/otEngine.js
// Simple Operational Transformation engine
// Handles concurrent edits without text overwrites or cursor jumps
 
/**
 * An Operation looks like:
 * { type: 'insert', position: 5, text: 'A', version: 3, author: 'shruthii' }
 * { type: 'delete', position: 5, length: 1, version: 3, author: 'shruthii' }
 */
 
/**
 * Transform operation A against operation B.
 * Returns a new operation A' that can be applied after B has already been applied.
 */
export function transform(opA, opB) {
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opB.position < opA.position ||
       (opB.position === opA.position && opB.author < opA.author)) {
      return { ...opA, position: opA.position + opB.text.length };
    }
    return opA;
  }
 
  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      return { ...opA, position: Math.max(opB.position, opA.position - opB.length) };
    }
    return opA;
  }
 
  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opB.position <= opA.position) {
      return { ...opA, position: opA.position + opB.text.length };
    }
    return opA;
  }
 
  if (opA.type === 'delete' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      const overlap = Math.min(opB.position + opB.length, opA.position) - opB.position;
      return { ...opA, position: opA.position - overlap, length: opA.length };
    }
    return opA;
  }
 
  return opA;
}
 
/**
 * Apply an operation to a string and return the new string.
 */
export function applyOp(text, op) {
  if (op.type === 'insert') {
    return text.slice(0, op.position) + op.text + text.slice(op.position);
  }
  if (op.type === 'delete') {
    return text.slice(0, op.position) + text.slice(op.position + op.length);
  }
  return text;
}
 
/**
 * Generate an operation from a Monaco editor change event.
 * Monaco gives us changes[] with rangeOffset, rangeLength, text.
 */
export function monacoChangeToOp(change, version, author) {
  if (change.text.length > 0 && change.rangeLength === 0) {
    return {
      type:     'insert',
      position: change.rangeOffset,
      text:     change.text,
      version,
      author,
    };
  }
  if (change.rangeLength > 0 && change.text.length === 0) {
    return {
      type:     'delete',
      position: change.rangeOffset,
      length:   change.rangeLength,
      version,
      author,
    };
  }
  // Replace = delete + insert
  if (change.rangeLength > 0 && change.text.length > 0) {
    return [
      { type: 'delete', position: change.rangeOffset, length: change.rangeLength, version, author },
      { type: 'insert', position: change.rangeOffset, text: change.text, version, author },
    ];
  }
  return null;
}