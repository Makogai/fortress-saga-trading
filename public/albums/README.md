# Album assets (public fallback)

**Preferred for bundling:** `src/assets/albums/<slug>/` (e.g. `equipment-album/cover.png`, `01.png`…`10.png`).

This folder is used when assets aren’t in `src`. Your current structure is supported:

```
public/albums/
  forest-of-order-season/
    cover.png                    ← optional season cover
    1 Equipment Album/
      cover.png
      caligo-pride.png           ← card images by name (slug of card name)
      ...
    2 Monster Album/
      cover.png
      ...
```

- **Album folders:** `1 Equipment Album`, `2 Monster Album`, … (number + space + title).
- **Cover:** `cover.png` in each album folder.
- **Card images:** `<card-name-slug>.png` (e.g. `caligo-pride.png`, `sky-dragonbone-sword.png`). Same order as in the catalog; names are lowercased and spaces replaced with `-`, other characters removed.

If you use the flat structure instead (`public/albums/equipment-album/cover.png` and `01.png`…`10.png`), that is also supported as a fallback.
