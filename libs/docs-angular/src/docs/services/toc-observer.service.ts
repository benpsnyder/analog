import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import type { ContentHeading } from './remark-renderer.provider';

@Injectable()
export class TocObserverService {
  readonly activeHeadingId = signal<string | null>(null);
  readonly visibleHeadingIds = signal<string[]>([]);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;
  private consumerCount = 0;
  private observedHeadings: ContentHeading[] = [];
  private readonly visibleHeadingIdSet = new Set<string>();

  connect(headings: ContentHeading[]): () => void {
    this.consumerCount += 1;
    this.observe(headings);

    return () => {
      this.consumerCount = Math.max(0, this.consumerCount - 1);
      if (this.consumerCount === 0) {
        this.disconnect();
        this.observedHeadings = [];
        this.visibleHeadingIdSet.clear();
        this.visibleHeadingIds.set([]);
        this.activeHeadingId.set(null);
      }
    };
  }

  private observe(headings: ContentHeading[]): void {
    const nextHeadings = [...headings];
    const isSameHeadings = this.matchesObservedHeadings(nextHeadings);

    if (!isPlatformBrowser(this.platformId)) {
      this.observedHeadings = nextHeadings;
      const firstId = nextHeadings[0]?.id ?? null;
      this.activeHeadingId.set(firstId);
      this.visibleHeadingIds.set(firstId ? [firstId] : []);
      return;
    }

    if (isSameHeadings && this.observer) {
      this.updateStateFromVisibility(0);
      return;
    }

    this.disconnect();
    this.observedHeadings = nextHeadings;
    this.visibleHeadingIdSet.clear();
    this.visibleHeadingIds.set([]);
    this.activeHeadingId.set(nextHeadings[0]?.id ?? null);

    const win = this.document.defaultView;
    if (!win || !('IntersectionObserver' in win)) {
      return;
    }

    const headingElements = nextHeadings
      .map((heading) => this.document.getElementById(heading.id))
      .filter((element): element is HTMLElement =>
        this.hasBoundingClientRect(element),
      );

    if (headingElements.length === 0) {
      return;
    }

    this.observer = new win.IntersectionObserver(
      (entries) => {
        this.onVisibilityChange(entries);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      },
    );

    for (const element of headingElements) {
      this.observer.observe(element);
    }

    this.updateStateFromVisibility(0);
  }

  private onVisibilityChange(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const element = entry.target;
      if (!element?.id) {
        continue;
      }
      if (entry.isIntersecting) {
        this.visibleHeadingIdSet.add(element.id);
      } else {
        this.visibleHeadingIdSet.delete(element.id);
      }
    }

    const viewTop = entries[0]?.rootBounds?.top ?? 0;
    this.updateStateFromVisibility(viewTop);
  }

  private updateStateFromVisibility(viewTop: number): void {
    const visibleIds = this.observedHeadings
      .map((heading) => heading.id)
      .filter((id) => this.visibleHeadingIdSet.has(id));

    const fallback = this.getNearestHeading(viewTop);
    const displayIds =
      visibleIds.length > 0 ? visibleIds : fallback ? [fallback] : [];
    this.visibleHeadingIds.set(displayIds);

    const activeId =
      displayIds[0] ?? fallback ?? this.observedHeadings[0]?.id ?? null;
    this.activeHeadingId.set(activeId);
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private matchesObservedHeadings(headings: ContentHeading[]): boolean {
    if (headings.length !== this.observedHeadings.length) {
      return false;
    }

    for (let index = 0; index < headings.length; index += 1) {
      if (headings[index]?.id !== this.observedHeadings[index]?.id) {
        return false;
      }
    }

    return true;
  }

  private getNearestHeading(viewTop: number): string | null {
    let nearestId: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const heading of this.observedHeadings) {
      const element = this.document.getElementById(heading.id);
      if (!this.hasBoundingClientRect(element)) {
        continue;
      }

      const distance = Math.abs(viewTop - element.getBoundingClientRect().top);
      if (distance < minDistance) {
        minDistance = distance;
        nearestId = heading.id;
      }
    }

    return nearestId;
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
