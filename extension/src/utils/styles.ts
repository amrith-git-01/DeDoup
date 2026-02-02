// Reusable Tailwind CSS class strings for consistent styling across the extension

/**
 * Card hover animation - subtle scale and lift effect
 * Use this for interactive cards that should respond to hover
 */
export const CARD_HOVER_ANIMATION = "hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-200"

/**
 * Stats card hover animation - same as card hover but can be customized separately
 */
export const STATS_CARD_HOVER = "hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-200"

/**
 * Base card styles - white background with border and rounded corners
 */
export const BASE_CARD = "bg-white rounded-lg shadow-sm border border-gray-200"

/**
 * Small card styles - gray background for nested cards
 */
export const SMALL_CARD = "bg-gray-50 rounded-lg"

/**
 * Small card with hover - combines small card with hover animation
 */
export const SMALL_CARD_HOVER = `${SMALL_CARD} hover:bg-gray-100 ${CARD_HOVER_ANIMATION}`
