import {
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ContentHeading } from '../services/remark-renderer.provider';
import { TocObserverService } from '../services/toc-observer.service';

@Component({
  selector: 'ng-docs-toc-collapsed',
  imports: [RouterLink],
  host: {
    class: 'sticky top-14 z-10 mb-6 block xl:hidden',
  },
  template: `
    @if (toc().length > 0) {
      <div
        class="relative border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3 text-left"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="contentId"
          (click)="toggleExpanded()"
        >
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-foreground"
              >On this page</span
            >
            @if (activeHeadingText(); as headingText) {
              <span class="block truncate text-xs text-muted-foreground">
                {{ headingText }}
              </span>
            }
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-down shrink-0 transition-transform mx-0.5 "
            [class.rotate-180]="expanded()"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>

        @if (expanded()) {
          <nav
            [id]="contentId"
            aria-label="Table of contents"
            class="absolute inset-x-0 top-full z-20 border-b border-t border-border/70 bg-background/95 px-2 py-2 shadow-sm"
          >
            <ul class="space-y-1">
              @for (heading of toc(); track heading.id) {
                <li>
                  <a
                    [routerLink]="[]"
                    [fragment]="heading.id"
                    class="block rounded-md py-1 pr-2 text-sm transition-colors hover:bg-muted/60"
                    [class.bg-muted]="activeHeadingId() === heading.id"
                    [class.text-foreground]="activeHeadingId() === heading.id"
                    [class.text-muted-foreground]="
                      activeHeadingId() !== heading.id
                    "
                    [style.padding-left.rem]="0.75 + (heading.level - 2) * 0.6"
                    (click)="collapse()"
                  >
                    {{ heading.text }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        }
      </div>
    }
  `,
})
export class DocsTocCollapsed {
  private readonly tocObserver = inject(TocObserverService);
  readonly toc = input<ContentHeading[]>([]);
  readonly expanded = signal(false);
  readonly activeHeadingId = this.tocObserver.activeHeadingId;
  readonly activeHeadingText = computed(() => {
    const activeId = this.activeHeadingId();
    if (!activeId) {
      return null;
    }
    return this.toc().find((heading) => heading.id === activeId)?.text ?? null;
  });
  readonly contentId = 'docs-toc-collapsed-content';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect((onCleanup) => {
      const headings = this.toc();

      if (headings.length === 0) {
        return;
      }

      if (!this.isBrowser) {
        const disconnect = this.tocObserver.connect(headings);
        onCleanup(() => {
          disconnect();
        });
        return;
      }

      let disconnect = () => {};
      const timeoutId = globalThis.setTimeout(() => {
        disconnect = this.tocObserver.connect(headings);
      }, 0);

      onCleanup(() => {
        globalThis.clearTimeout(timeoutId);
        disconnect();
      });
    });
  }

  toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  collapse(): void {
    this.expanded.set(false);
  }
}
