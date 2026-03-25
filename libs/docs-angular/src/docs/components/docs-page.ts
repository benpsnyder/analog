import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import type { ContentHeading } from '../services/remark-renderer.provider';
import { TocObserverService } from '../services/toc-observer.service';
import { DocsToc } from './docs-toc';
import { DocsTocCollapsed } from './docs-toc-collapsed';

/**
 * Reusable docs article template with heading TOC behavior.
 */
@Component({
  selector: 'ng-docs-page',
  imports: [DocsToc, DocsTocCollapsed],
  providers: [TocObserverService],
  template: `
    @let pageData = page();
    @if (pageData) {
      <ng-docs-toc-collapsed [toc]="toc()" />
      <div class="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <article class="min-w-0 flex-1 md:px-16 py-6 px-6 prose-docs">
          <ng-content></ng-content>
        </article>
        <ng-docs-toc [toc]="toc()" />
      </div>
    }
  `,
})
export class DocsPage {
  readonly page = input<Record<string, any> | null | undefined>(undefined);
  readonly toc = input<ContentHeading[]>([]);

  private readonly el = inject(ElementRef);

  constructor() {
    afterNextRender(() => this.initTabs());
  }

  private initTabs(): void {
    const containers = this.el.nativeElement.querySelectorAll('[data-tabs]');
    for (const container of containers) {
      if (container.dataset['tabsInit']) continue;
      container.dataset['tabsInit'] = 'true';

      const triggers: HTMLButtonElement[] = Array.from(
        container.querySelectorAll('.tab-trigger'),
      );
      const panels: HTMLElement[] = Array.from(
        container.querySelectorAll('.tab-panel'),
      );

      for (const trigger of triggers) {
        trigger.addEventListener('click', () => {
          const value = trigger.dataset['tabValue'];
          for (const t of triggers) {
            t.setAttribute('aria-selected', String(t === trigger));
            t.tabIndex = t === trigger ? 0 : -1;
          }
          for (const p of panels) {
            p.hidden = p.dataset['tabPanel'] !== value;
          }
        });
      }
    }
  }
}
