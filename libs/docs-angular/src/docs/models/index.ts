/**
 * Document metadata structure
 */
export interface DocMeta {
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Navigation item for docs sidebar
 */
export interface NavItem {
  description: string;
  name: string;
  type: 'folder' | 'page';
  slug: string;
  $id?: string;
  url?: string;
  $ref?: {
    file: string;
  };
  children?: NavItem[];
  index?: NavItem;
}

export interface DocsTreeRoot {
  $id: string;
  name: string;
  children: NavItem[];
}

/**
 * Parsed document with metadata and content
 */
export interface Doc {
  slug: string;
  title: string;
  description?: string;
  content: string;
  metadata?: Record<string, unknown>;
}
