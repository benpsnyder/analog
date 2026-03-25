import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ContentHeading } from '../services/remark-renderer.provider';
import { TocObserverService } from '../services/toc-observer.service';

@Component({
  selector: 'ng-docs-toc',
  imports: [RouterLink],
  host: {
    class: 'hidden self-start xl:sticky xl:top-24 xl:block',
  },
  template: `
    @if (toc().length > 0) {
      <div>
        <p class="mb-3 text-sm font-semibold text-foreground">
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
            class="lucide lucide-text-align-start-icon lucide-text-align-start inline-block w-5 mr-2"
          >
            <path d="M21 5H3" />
            <path d="M15 12H3" />
            <path d="M17 19H3" />
          </svg>
          <span>On this page</span>
        </p>
        <nav
          aria-label="Table of contents"
          class="max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
        >
          <div class="relative pb-9">
            <span
              aria-hidden="true"
              class="pointer-events-none absolute -left-px top-0 h-px w-0.5 origin-top rounded-full bg-primary transition-transform duration-200 ease-out will-change-transform"
              [class.opacity-0]="!indicatorVisible()"
              [class.opacity-100]="indicatorVisible()"
              [style.transform]="
                'translateY(' +
                indicatorTranslateY() +
                'px) scaleY(' +
                indicatorScaleY() +
                ')'
              "
            ></span>
            <ul class="space-y-1 border-l border-border/70" data-toc-list>
              @for (heading of toc(); track heading.id) {
                <li>
                  <a
                    [routerLink]="[]"
                    [fragment]="heading.id"
                    [attr.data-heading-id]="heading.id"
                    class="block border-transparent py-1 pr-2 text-sm transition-colors hover:border-primary hover:text-foreground"
                    [class.text-foreground]="activeHeadingId() === heading.id"
                    [class.text-muted-foreground]="
                      activeHeadingId() !== heading.id
                    "
                    [style.padding-left.rem]="0.75 + (heading.level - 2) * 0.6"
                  >
                    {{ heading.text }}
                  </a>
                </li>
              }
            </ul>
          </div>
        </nav>
      </div>
    }
  `,
})
export class DocsToc {
  private readonly tocObserver = inject(TocObserverService);
  readonly toc = input<ContentHeading[]>([]);
  readonly activeHeadingId = this.tocObserver.activeHeadingId;
  readonly visibleHeadingIds = this.tocObserver.visibleHeadingIds;
  readonly indicatorTranslateY = signal(0);
  readonly indicatorScaleY = signal(1);
  readonly indicatorVisible = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeHandler: (() => void) | null = null;

  constructor() {
    effect((onCleanup) => {
      const headings = this.toc();
      this.detachResizeHandler();
      this.indicatorVisible.set(false);

      if (headings.length === 0) {
        return;
      }

      if (!this.isBrowser) {
        const disconnect = this.tocObserver.connect(headings);
        onCleanup(() => {
          disconnect();
          this.indicatorVisible.set(false);
        });
        return;
      }

      let disconnect = () => {};
      const timeoutId = globalThis.setTimeout(() => {
        disconnect = this.tocObserver.connect(headings);
        this.attachResizeHandler();
        this.updateIndicatorBounds();
      }, 0);

      onCleanup(() => {
        globalThis.clearTimeout(timeoutId);
        disconnect();
        this.detachResizeHandler();
        this.indicatorVisible.set(false);
      });
    });

    effect(() => {
      if (!this.isBrowser) {
        return;
      }
      this.activeHeadingId();
      this.visibleHeadingIds();
      this.updateIndicatorBounds();
    });
  }

  private attachResizeHandler(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    this.resizeHandler = () => this.updateIndicatorBounds();
    win.addEventListener('resize', this.resizeHandler);
  }

  private detachResizeHandler(): void {
    const win = this.document.defaultView;
    if (win && this.resizeHandler) {
      win.removeEventListener('resize', this.resizeHandler);
    }
    this.resizeHandler = null;
  }

  private updateIndicatorBounds(): void {
    const list = this.host.nativeElement.querySelector('[data-toc-list]');
    if (!this.hasBoundingClientRect(list)) {
      this.indicatorVisible.set(false);

      return;
    }

    const visibleIds = this.visibleHeadingIds();
    const startId = visibleIds[0];
    const endId = visibleIds[visibleIds.length - 1];

    if (!startId || !endId) {
      this.indicatorVisible.set(false);

      return;
    }

    const links = Array.from(
      list.querySelectorAll('[data-heading-id]'),
    ) as HTMLElement[];
    const startLink = links.find(
      (link) => link.dataset['headingId'] === startId,
    );
    const endLink = links.find((link) => link.dataset['headingId'] === endId);
    if (
      !this.hasBoundingClientRect(startLink) ||
      !this.hasBoundingClientRect(endLink)
    ) {
      this.indicatorVisible.set(false);

      return;
    }

    const listRect = list.getBoundingClientRect();
    const startRect = startLink.getBoundingClientRect();
    const endRect = endLink.getBoundingClientRect();
    const top = Math.max(0, startRect.top - listRect.top);
    const height = Math.max(0, endRect.bottom - startRect.top);

    this.indicatorTranslateY.set(top);
    this.indicatorScaleY.set(Math.max(1, height));
    this.indicatorVisible.set(height > 0);
  }

  private hasBoundingClientRect(element: unknown): element is HTMLElement {
    return (
      typeof element === 'object' &&
      element !== null &&
      'getBoundingClientRect' in element &&
      typeof element.getBoundingClientRect === 'function'
    );
  }
}
