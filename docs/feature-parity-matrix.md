# Feature Parity Matrix

| Feature | Editor | Production | Notes |
|---------|--------|------------|-------|
| Style overrides (color/typo/bg) | ✅ | ❌ (scoped CSS only in preview) | By design — non-destructive |
| Animations (shimmer/float/breathe) | ✅ | ✅ | Via BlockRendererClient |
| Animation speed control | ✅ | ✅ | CSS custom properties |
| CSS overlays | ✅ | ⚡ (feature flag) | NEXT_PUBLIC_ENABLE_CSS_OVERLAYS |
| Template per-page | ✅ | ✅ (metadata only) | Template selector |
| Inline text editing | ✅ | N/A | Editor-only |
| Batch operations | ✅ | N/A | Editor-only |
| AI content suggestions | ✅ | N/A | Offline-first templates |
| A11y audit | ✅ | N/A | Editor-only |
| Split preview | ✅ | N/A | Editor-only |
