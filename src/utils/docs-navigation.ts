import fs from 'fs';
import path from 'path';

export interface NavItem {
  label: string;
  href: string;
  items?: NavItem[];
  order?: number;
  icon?: string;
  expandedByDefault?: boolean;
}

interface CategoryMetadata {
  name?: string;
  icon?: string;
  order?: number;
  expandedByDefault?: boolean;
}

function scanDirectory(
  dir: string,
  baseDir: string,
  basePath: string = '/docs'
): NavItem[] {
  const items: NavItem[] = [];

  if (!fs.existsSync(dir)) {
    return items;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) {
        continue;
      }

      const indexPath = path.join(fullPath, 'index.mdx');
      const altIndexPath = path.join(fullPath, 'index.md');
      const hasIndex = fs.existsSync(indexPath) || fs.existsSync(altIndexPath);

      const metadataPath = path.join(fullPath, '_metadata_.json');
      let metadata: CategoryMetadata = {};

      if (fs.existsSync(metadataPath)) {
        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          metadata = JSON.parse(metadataContent);
        } catch (e) {
          console.warn(`Failed to parse metadata for ${entry.name}:`, e);
        }
      }

      const label = metadata.name || formatLabel(entry.name);
      const dirHref = `${basePath}/${relativePath.replace(/\\/g, '/')}`;

      if (hasIndex) {
        items.push({
          label,
          href: dirHref,
          order: metadata.order,
          icon: metadata.icon,
          expandedByDefault: metadata.expandedByDefault ?? false,
        });
      } else {
        const subItems = scanDirectory(fullPath, baseDir, basePath);

        if (subItems.length > 0) {
          items.push({
            label,
            href: subItems[0]?.href || dirHref,
            items: subItems,
            order: metadata.order,
            icon: metadata.icon,
            expandedByDefault: metadata.expandedByDefault ?? false,
          });
        }
      }
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      if (entry.name === 'index.mdx' || entry.name === 'index.md') {
        continue;
      }

      const fileNameWithoutExt = entry.name.replace(/\.(mdx?|md)$/, '');
      const label = formatLabel(fileNameWithoutExt);
      const href = `${basePath}/${relativePath.replace(/\\/g, '/').replace(/\.(mdx?|md)$/, '')}`;

      items.push({
        label,
        href,
      });
    }
  }

  items.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });

  return items;
}

function formatLabel(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function scanProjectDirectory(
  dir: string,
  baseDir: string,
  basePath: string = '/docs'
): NavItem {
  const projectName = path.basename(dir);
  const metadataPath = path.join(dir, '_metadata_.json');
  let metadata: CategoryMetadata = {};
  
  if (fs.existsSync(metadataPath)) {
    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch (e) {
      console.warn(`Failed to parse metadata for ${projectName}:`, e);
    }
  }
  
  const label = metadata.name || formatLabel(projectName);
  const projectHref = `${basePath}/${path.relative(baseDir, dir).replace(/\\/g, '/')}`;
  
  const projectPages: NavItem[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) {
      continue;
    }
    
    if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
      if (entry.name === 'index.mdx' || entry.name === 'index.md') {
        continue;
      }
      
      const fileNameWithoutExt = entry.name.replace(/\.(mdx?|md)$/, '');
      const pageLabel = formatLabel(fileNameWithoutExt);
      const pageHref = `${projectHref}/${fileNameWithoutExt}`;
      
      projectPages.push({
        label: pageLabel,
        href: pageHref,
      });
    } else if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name);
      const subPages = scanDirectory(subDir, baseDir, basePath);
      projectPages.push(...subPages);
    }
  }
  
  projectPages.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  
  return {
    label,
    href: projectHref,
    items: projectPages.length > 0 ? projectPages : [],
    order: metadata.order,
    icon: metadata.icon,
    expandedByDefault: metadata.expandedByDefault ?? false,
  };
}

export function generateNavigation(): NavItem[] {
  const docsDir = path.join(process.cwd(), 'src', 'pages', 'docs');
  const allItems = scanDirectory(docsDir, docsDir, '/docs');
  
  const projectSections: NavItem[] = [];
  const topLevelItems: NavItem[] = [];
  
  const projectTypeDirs = ['modpacks', 'mods', 'plugins', 'resource-packs'];
  
  for (const typeDir of projectTypeDirs) {
    const typePath = path.join(docsDir, typeDir);
    if (!fs.existsSync(typePath)) {
      continue;
    }
    
    const entries = fs.readdirSync(typePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        const projectPath = path.join(typePath, entry.name);
        const projectSection = scanProjectDirectory(projectPath, docsDir, '/docs');
        projectSections.push(projectSection);
      }
    }
  }
  
  for (const item of allItems) {
    if (item.label === 'Getting Started' || item.label === 'FAQ') {
      topLevelItems.push(item);
    } else if (item.label === 'Projects') {
      continue;
    } else if (!projectTypeDirs.some(type => item.href.includes(`/${type}/`))) {
      topLevelItems.push(item);
    }
  }
  
  projectSections.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  
  const projectsMetadataPath = path.join(process.cwd(), 'src', 'pages', 'docs', 'projects', '_metadata_.json');
  let projectsMetadata: CategoryMetadata = {};
  
  if (fs.existsSync(projectsMetadataPath)) {
    try {
      const metadataContent = fs.readFileSync(projectsMetadataPath, 'utf-8');
      projectsMetadata = JSON.parse(metadataContent);
    } catch (e) {
      console.warn('Failed to parse projects metadata:', e);
    }
  }
  
  const projectsSection: NavItem = {
    label: projectsMetadata.name || 'Projects',
    href: '/docs/projects',
    items: projectSections,
    order: projectsMetadata.order,
    icon: projectsMetadata.icon,
    expandedByDefault: projectsMetadata.expandedByDefault ?? true,
  };
  
  const finalItems: NavItem[] = [...topLevelItems];
  
  if (projectSections.length > 0) {
    finalItems.push(projectsSection);
  }
  
  finalItems.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  
  return finalItems;
}

export function getDocsPages(): string[] {
  const pages: string[] = [];

  function collectPages(items: NavItem[]) {
    for (const item of items) {
      pages.push(item.href);
      if (item.items) {
        collectPages(item.items);
      }
    }
  }

  const navigation = generateNavigation();
  collectPages(navigation);

  return pages;
}

export function findCurrentItem(
  navigation: NavItem[],
  currentPath: string
): NavItem | null {
  for (const item of navigation) {
    if (item.href === currentPath) {
      return item;
    }
    if (item.items) {
      const found = findCurrentItem(item.items, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function isActiveOrHasActiveChild(
  item: NavItem,
  currentPath: string
): boolean {
  if (item.href === currentPath) {
    return true;
  }
  if (item.items) {
    return item.items.some((child) =>
      isActiveOrHasActiveChild(child, currentPath)
    );
  }
  return false;
}
