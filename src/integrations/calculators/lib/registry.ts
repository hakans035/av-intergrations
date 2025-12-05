import type { CalculatorConfig, CalculatorModule } from '../types/calculator'
import type { RegistryEntry, LoadedCalculator, RegistryStats } from './registry-types'

/**
 * Calculator Registry
 * Central lookup system for all calculator modules
 */
class CalculatorRegistry {
  private entries: Map<string, RegistryEntry> = new Map()
  private moduleCache: Map<string, CalculatorModule> = new Map()

  /**
   * Register a calculator
   */
  register(config: CalculatorConfig, path: string): void {
    if (this.entries.has(config.slug)) {
      console.warn(`[Registry] Duplicate slug detected: ${config.slug}`)
      return
    }

    this.entries.set(config.slug, {
      slug: config.slug,
      name: config.name,
      description: config.description,
      version: config.version,
      status: config.status,
      category: config.category,
      path,
    })
  }

  /**
   * Check if calculator exists
   */
  has(slug: string): boolean {
    return this.entries.has(slug)
  }

  /**
   * Get registry entry by slug
   */
  get(slug: string): RegistryEntry | undefined {
    return this.entries.get(slug)
  }

  /**
   * Get all slugs
   */
  getAllSlugs(): string[] {
    return Array.from(this.entries.keys())
  }

  /**
   * Get all entries
   */
  getAll(): RegistryEntry[] {
    return Array.from(this.entries.values())
  }

  /**
   * Get entries by status
   */
  getByStatus(status: CalculatorConfig['status']): RegistryEntry[] {
    return this.getAll().filter((entry) => entry.status === status)
  }

  /**
   * Get entries by category
   */
  getByCategory(category: CalculatorConfig['category']): RegistryEntry[] {
    return this.getAll().filter((entry) => entry.category === category)
  }

  /**
   * Get active calculators only
   */
  getActive(): RegistryEntry[] {
    return this.getByStatus('active')
  }

  /**
   * Load calculator module dynamically
   */
  async load(slug: string): Promise<LoadedCalculator | null> {
    const entry = this.get(slug)
    if (!entry) {
      console.error(`[Registry] Calculator not found: ${slug}`)
      return null
    }

    if (entry.status === 'disabled') {
      console.warn(`[Registry] Calculator is disabled: ${slug}`)
      return null
    }

    // Check cache
    const cached = this.moduleCache.get(slug)
    if (cached) {
      return {
        config: cached.config,
        module: cached,
      }
    }

    try {
      // Dynamic import - path is relative to calculators folder
      const module = (await import(
        `@/integrations/calculators/calculators/${slug}`
      )) as CalculatorModule

      // Validate module exports
      if (!this.validateModule(module)) {
        console.error(`[Registry] Invalid module exports: ${slug}`)
        return null
      }

      // Cache module
      this.moduleCache.set(slug, module)

      return {
        config: module.config,
        module,
      }
    } catch (error) {
      console.error(`[Registry] Failed to load calculator: ${slug}`, error)
      return null
    }
  }

  /**
   * Validate module has required exports
   */
  private validateModule(module: unknown): module is CalculatorModule {
    const m = module as Record<string, unknown>
    return (
      typeof m.config === 'object' &&
      typeof m.calculate === 'function' &&
      typeof m.CalculatorUI !== 'undefined' &&
      typeof m.inputSchema !== 'undefined' &&
      typeof m.outputSchema !== 'undefined'
    )
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const all = this.getAll()
    const byCategory: Record<string, number> = {}

    for (const entry of all) {
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1
    }

    return {
      total: all.length,
      active: all.filter((e) => e.status === 'active').length,
      beta: all.filter((e) => e.status === 'beta').length,
      deprecated: all.filter((e) => e.status === 'deprecated').length,
      disabled: all.filter((e) => e.status === 'disabled').length,
      byCategory,
    }
  }

  /**
   * Clear registry (for testing)
   */
  clear(): void {
    this.entries.clear()
    this.moduleCache.clear()
  }
}

// Export singleton instance
export const registry = new CalculatorRegistry()
