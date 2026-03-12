/**
 * Operational Transformation (OT) Server Utility
 * Handles conflict resolution for concurrent edits
 * 
 * OT works by:
 * 1. Each edit is an operation: { type: "insert" | "delete", index, text/length }
 * 2. When two users edit simultaneously, operations must be transformed
 * 3. Transform resolves the order: Op A and Op B both execute, but in compatible way
 * 4. Result: all clients converge to same state regardless of edit order
 */

/**
 * Transform operation A against operation B
 * Returns new operation A that can be applied after B
 * 
 * Example:
 * - User A: Insert "hello" at index 0  → Op A
 * - User B: Delete 1 char at index 10  → Op B
 * - Result: Transform A → keeps insert at 0 (B's delete doesn't affect it)
 */
export function transformOp(opA, opB) {
  // If A is insert and B is insert
  if (opA.type === 'insert' && opB.type === 'insert') {
    // If inserting at same position, A's position stays (tie-breaking by timestamp/userId)
    if (opA.index > opB.index) {
      return {
        ...opA,
        index: opA.index + opB.text.length,
      };
    }
    // If inserting before or at same position, index unchanged
    return opA;
  }

  // If A is insert and B is delete
  if (opA.type === 'insert' && opB.type === 'delete') {
    // If deleting before A's insert, move A backwards
    if (opB.index < opA.index) {
      return {
        ...opA,
        index: Math.max(opB.index, opA.index - opB.length),
      };
    }
    // If deleting at or after A's insert, A's position unaffected
    return opA;
  }

  // If A is delete and B is insert
  if (opA.type === 'delete' && opB.type === 'insert') {
    // If inserting before A's delete, move A forward
    if (opB.index <= opA.index) {
      return {
        ...opA,
        index: opA.index + opB.text.length,
      };
    }
    // If inserting after A's delete, A's position unaffected
    return opA;
  }

  // If A is delete and B is delete
  if (opA.type === 'delete' && opB.type === 'delete') {
    // Both deleting from same position
    if (opA.index === opB.index) {
      return {
        ...opA,
        length: Math.max(0, opA.length - opB.length),
      };
    }
    // B deletes before A
    if (opB.index < opA.index) {
      return {
        ...opA,
        index: Math.max(opB.index, opA.index - opB.length),
      };
    }
    // B deletes after A
    return opA;
  }

  return opA;
}

/**
 * Apply operation to text
 */
export function applyOp(text = '', op) {
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

  return text;
}

/**
 * Transform pending operations list against incoming operation
 * Returns transformed pending operations that can be applied after incoming op
 */
export function transformPendingOps(pendingOps, incomingOp) {
  return pendingOps.map((op) => transformOp(op, incomingOp));
}

/**
 * Create insert operation from text
 */
export function createInsertOp(text, index) {
  return {
    type: 'insert',
    index,
    text,
  };
}

/**
 * Create delete operation
 */
export function createDeleteOp(index, length) {
  return {
    type: 'delete',
    index,
    length,
  };
}

/**
 * Validate operation format
 */
export function isValidOp(op) {
  if (!op || typeof op !== 'object') return false;

  if (op.type === 'insert') {
    return (
      typeof op.index === 'number' &&
      typeof op.text === 'string' &&
      op.index >= 0
    );
  }

  if (op.type === 'delete') {
    return (
      typeof op.index === 'number' &&
      typeof op.length === 'number' &&
      op.index >= 0 &&
      op.length > 0
    );
  }

  return false;
}
