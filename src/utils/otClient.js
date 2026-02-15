/**
 * Client-side Operational Transformation (OT)
 * Generates operations from code changes and applies remote operations
 */

/**
 * Detect operation from before/after text
 * 
 * This function compares the old and new text to determine what operation occurred.
 * It detects:
 * - Single insert: detected by finding new substring
 * - Single delete: detected by finding missing substring
 * - Complex changes: fallback to full sync
 */
export function detectOperation(oldText = '', newText = '') {
  if (oldText === newText) {
    return null; // No change
  }

  if (oldText.length === 0) {
    // Insert all new text
    return {
      type: 'insert',
      index: 0,
      text: newText,
    };
  }

  if (newText.length === 0) {
    // Delete all text
    return {
      type: 'delete',
      index: 0,
      length: oldText.length,
    };
  }

  // Find longest common prefix
  let prefixLen = 0;
  while (
    prefixLen < oldText.length &&
    prefixLen < newText.length &&
    oldText[prefixLen] === newText[prefixLen]
  ) {
    prefixLen++;
  }

  // Find longest common suffix
  let suffixLen = 0;
  while (
    suffixLen < oldText.length - prefixLen &&
    suffixLen < newText.length - prefixLen &&
    oldText[oldText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const oldMiddle = oldText.slice(prefixLen, oldText.length - suffixLen);
  const newMiddle = newText.slice(prefixLen, newText.length - suffixLen);

  // If only text was added
  if (oldMiddle.length === 0) {
    return {
      type: 'insert',
      index: prefixLen,
      text: newMiddle,
    };
  }

  // If only text was deleted
  if (newMiddle.length === 0) {
    return {
      type: 'delete',
      index: prefixLen,
      length: oldMiddle.length,
    };
  }

  // Complex multi-character change - fallback to full sync
  return {
    type: 'full_sync',
    text: newText,
  };
}

/**
 * Apply operation to text
 */
export function applyOp(text = '', op) {
  if (!op) return text;

  if (op.type === 'insert') {
    return (
      text.slice(0, op.index) + op.text + text.slice(op.index)
    );
  }

  if (op.type === 'delete') {
    return (
      text.slice(0, op.index) + text.slice(op.index + op.length)
    );
  }

  if (op.type === 'full_sync') {
    return op.text || '';
  }

  return text;
}

/**
 * Transform operation A against operation B
 * Returns transformed operation A that applies correctly after B
 */
export function transformOp(opA, opB) {
  // Full sync takes precedence - can't transform against it
  if (opB.type === 'full_sync') {
    return opA; // Will be superseded anyway
  }

  // Insert vs Insert
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opA.index > opB.index) {
      return {
        ...opA,
        index: opA.index + opB.text.length,
      };
    }
    return opA;
  }

  // Insert vs Delete
  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opB.index < opA.index) {
      return {
        ...opA,
        index: Math.max(opB.index, opA.index - opB.length),
      };
    }
    return opA;
  }

  // Delete vs Insert
  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opB.index <= opA.index) {
      return {
        ...opA,
        index: opA.index + opB.text.length,
      };
    }
    return opA;
  }

  // Delete vs Delete
  if (opA.type === 'delete' && opB.type === 'delete') {
    if (opA.index === opB.index) {
      return {
        ...opA,
        length: Math.max(0, opA.length - opB.length),
      };
    }
    if (opB.index < opA.index) {
      return {
        ...opA,
        index: Math.max(opB.index, opA.index - opB.length),
      };
    }
    return opA;
  }

  return opA;
}

/**
 * OT Client class for managing local and remote operations
 */
export class OTClient {
  constructor(initialText = '') {
    this.text = initialText;
    this.pendingOps = []; // Operations waiting for ack from server
    this.version = 0;
  }

  /**
   * Submit local edit
   * Detects operation from old/new text and sends to server
   */
  submitEdit(newText) {
    const op = detectOperation(this.text, newText);
    if (!op) return null;

    this.text = newText;
    this.pendingOps.push(op);

    return op;
  }

  /**
   * Apply remote operation
   * Transforms pending operations and applies remote op
   */
  applyRemoteOp(op) {
    // Transform all pending ops against incoming op
    this.pendingOps = this.pendingOps.map((pendingOp) =>
      transformOp(pendingOp, op)
    );

    // Apply remote op to text
    this.text = applyOp(this.text, op);
    this.version++;

    return this.text;
  }

  /**
   * Acknowledge operation from server
   * Remove from pending list when server confirms
   */
  ackOp() {
    if (this.pendingOps.length > 0) {
      this.pendingOps.shift(); // Remove first (oldest) op
      this.version++;
    }
  }

  /**
   * Get current text
   */
  getText() {
    return this.text;
  }

  /**
   * Update text without creating operation
   * Used for full sync from server
   */
  sync(newText) {
    this.text = newText;
    this.pendingOps = []; // Clear pending since server sent full state
    return this.text;
  }

  /**
   * Reset state
   */
  reset(initialText = '') {
    this.text = initialText;
    this.pendingOps = [];
    this.version = 0;
  }
}

export default OTClient;
