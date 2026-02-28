// Category-specific placeholder images using picsum (reliable, no API key)
export const PLACEHOLDERS = {
  trade: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  events: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  recover: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
  expeditions: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  knowledge: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
  default: "/placeholder.svg",
} as const;

export function getPlaceholder(category: keyof typeof PLACEHOLDERS): string {
  return PLACEHOLDERS[category] || PLACEHOLDERS.default;
}
