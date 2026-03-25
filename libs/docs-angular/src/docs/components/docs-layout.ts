import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DocsTreeRoot, NavItem } from '../models';
/**
 * Main layout component for documentation sites
 * Provides sidebar navigation, breadcrumbs, and content area
 * Similar to Fumadocs UI layout
 */
@Component({
  selector: 'ng-docs-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-background text-foreground">
      <header
        class="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      >
        <div class="flex h-14 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
            (click)="openMobileSidebar()"
          >
            ☰
          </button>
          <span class="text-sm font-medium text-muted-foreground">{{
            navItems()?.name || 'Documentation'
          }}</span>
        </div>
      </header>

      <div
        class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)]"
      >
        @if (mobileSidebarOpen()) {
          <button
            type="button"
            class="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/40 lg:hidden"
            aria-label="Close sidebar"
            (click)="closeMobileSidebar()"
          ></button>
        }

        <aside
          class="fixed bottom-0 left-0 top-14 z-40 border-r border-border/70 bg-background transition-transform duration-200 ease-out lg:col-start-1 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0"
          [class.translate-x-0]="mobileSidebarOpen()"
          [class.-translate-x-full]="!mobileSidebarOpen()"
        >
          <div class="flex h-full flex-col">
            <div class="border-b border-border/70 px-4 py-4  lg:hidden">
              <div class="flex items-center justify-between">
                <span
                  class="text-sm font-semibold tracking-tight text-foreground"
                  >{{ navItems()?.name || 'Documentation' }}</span
                >
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted "
                  aria-label="Close sidebar"
                  (click)="closeMobileSidebar()"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-3 py-4">
              <nav
                [attr.aria-label]="'Documentation Navigation'"
                class="space-y-1"
              >
                <ng-container
                  *ngTemplateOutlet="
                    navList;
                    context: { $implicit: navItems()?.children ?? [], level: 0 }
                  "
                ></ng-container>
              </nav>
            </div>
          </div>
        </aside>

        <main class="">
          <ng-content />
        </main>
      </div>
    </div>

    <ng-template #navList let-items let-level="level">
      @for (item of items; track item.slug) {
        <div class="space-y-1">
          @if (item.type === 'page') {
            <a
              [routerLink]="item.url || item.slug"
              routerLinkActive
              [routerLinkActive]="[]"
              #pageLinkRla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              class="block rounded-md px-2 py-1.5 text-sm transition-colors"
              [class.font-medium]="pageLinkRla.isActive"
              [class.text-primary]="pageLinkRla.isActive"
              [class.bg-muted]="pageLinkRla.isActive"
              [class.text-foreground]="!pageLinkRla.isActive"
              [style.padding-left.rem]="0.5 + level * 0.75"
              (click)="closeMobileSidebar()"
            >
              {{ item.name }}
            </a>
          } @else {
            <div
              class="group flex items-center gap-1 rounded-md pr-1 transition-colors"
              [style.padding-left.rem]="0.5 + level * 0.75"
            >
              @if (item.index) {
                <a
                  [routerLink]="item.index.url || item.index.slug"
                  routerLinkActive
                  [routerLinkActive]="[]"
                  #folderIndexRla="routerLinkActive"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="flex-1 rounded-md py-1.5 text-sm font-medium transition-colors"
                  [ngClass]="
                    folderIndexLinkClasses(folderIndexRla.isActive, item.slug)
                  "
                  (click)="
                    onFolderIndexClick(
                      $event,
                      item.slug,
                      folderIndexRla.isActive
                    )
                  "
                >
                  {{ item.index.name }}
                </a>
              } @else {
                <button
                  type="button"
                  class="flex-1 rounded-md py-1.5 text-left text-sm font-medium text-foreground"
                  (click)="toggleFolder(item.slug)"
                >
                  {{ item.name }}
                </button>
              }

              <button
                type="button"
                class="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground "
                [attr.aria-label]="'Toggle ' + item.name"
                (click)="onFolderToggleClick($event, item.slug)"
              >
                <span
                  class="inline-flex transition-transform duration-200"
                  [class.rotate-90]="isExpanded(item.slug)"
                  >▸</span
                >
              </button>
            </div>

            @if (
              item.children && item.children.length > 0 && isExpanded(item.slug)
            ) {
              <div>
                <ng-container
                  *ngTemplateOutlet="
                    navList;
                    context: { $implicit: item.children, level: level + 1 }
                  "
                ></ng-container>
              </div>
            }
          }
        </div>
      }
    </ng-template>
  `,
})
export class DocsLayout {
  navItems = input<DocsTreeRoot>();
  private collapsedFolders = new Set<string>();
  readonly mobileSidebarOpen = signal(false);

  openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  isExpanded(slug: string): boolean {
    return !this.collapsedFolders.has(slug);
  }

  toggleFolder(slug: string): void {
    if (this.collapsedFolders.has(slug)) {
      this.collapsedFolders.delete(slug);
      return;
    }
    this.collapsedFolders.add(slug);
  }

  onFolderIndexClick(event: MouseEvent, slug: string, isActive: boolean): void {
    // Prevent row click handler; keep default navigation for inactive links.
    event.stopPropagation();
    if (isActive) {
      this.toggleFolder(slug);
      return;
    }
    this.closeMobileSidebar();
  }

  onFolderToggleClick(event: MouseEvent, slug: string): void {
    event.stopPropagation();
    this.toggleFolder(slug);
  }

  folderIndexLinkClasses(
    isActive: boolean,
    slug: string,
  ): Record<string, boolean> {
    const expanded = this.isExpanded(slug);
    return {
      'text-primary': isActive && expanded,
      'text-foreground': !isActive || !expanded,
      'hover:text-foreground': !isActive || !expanded,
    };
  }
}
