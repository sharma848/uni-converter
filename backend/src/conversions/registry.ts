/**
 * Central conversion registry
 * Manages all available conversion handlers
 */
import { ConversionHandler } from './types.js';

export class ConversionRegistry {
  private handlers: Map<string, ConversionHandler> = new Map();

  /**
   * Register a conversion handler
   */
  register(handler: ConversionHandler): void {
    if (this.handlers.has(handler.id)) {
      throw new Error(`Conversion handler with id '${handler.id}' is already registered`);
    }
    this.handlers.set(handler.id, handler);
  }

  /**
   * Get a handler by ID
   */
  get(id: string): ConversionHandler | undefined {
    return this.handlers.get(id);
  }

  /**
   * Get all registered handler IDs
   */
  getAllIds(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get all handlers with their metadata
   */
  getAllHandlers(): ConversionHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get handler metadata for API responses
   */
  getHandlersInfo(): Array<{ type: string; name: string; description: string }> {
    return Array.from(this.handlers.values()).map(handler => ({
      type: handler.id,
      name: handler.name,
      description: handler.description
    }));
  }

  /**
   * Check if a handler exists
   */
  has(id: string): boolean {
    return this.handlers.has(id);
  }
}

