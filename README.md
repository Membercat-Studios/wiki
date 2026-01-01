# Membercat Studios Wiki

The official wiki/documentation site for Membercat Studios - a Minecraft content studio creating plugins, mods, modpacks, and resource packs.

### Prerequisites

- [Bun](https://bun.sh) v1.3.3 or later

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start Astro development server
bun run dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
# Build for production
bun run build
```

### Preview

You can preview the production build locally using either of the following methods:

```bash
# Option 1: Use the built-in Astro preview command
bun run preview

# Option 2: Use the "serve" package (must install)
serve ./dist
```

## Adding Documentation

### Creating a New Documentation Page

1. **Create a directory** in `src/pages/docs/` for your category (e.g., `modpacks/my-modpack/`)

2. **Create an `index.mdx` file** with frontmatter:

   ```mdx
   ---
   layout: ../../../layouts/MDXLayout.astro
   title: My Modpack
   summary: A description of my modpack
   type: modpack # Options: modpack, mod, plugin, resource-pack, data-pack
   order: 1
   ---

   Your documentation content here...
   ```

3. **Optional: Create `_metadata_.json`** for category customization:
   ```json
   {
     "name": "My Modpack",
     "icon": "fa-solid fa-box",
     "order": 1,
     "expandedByDefault": true
   }
   ```

### Navigation Structure

The navigation is automatically generated from the file structure:

- Directories become navigation sections
- `index.mdx` files become the main page for a section
- Other `.mdx` files become sub-pages
- Ordering is controlled by `order` in metadata or alphabetical

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run astro` - Run Astro CLI commands
