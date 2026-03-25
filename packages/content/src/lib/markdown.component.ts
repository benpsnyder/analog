import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  InputSignal,
  NgZone,
  PLATFORM_ID,
  Signal,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Data } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AnchorNavigationDirective } from './anchor-navigation.directive';
import { ContentRenderer } from './content-renderer';
import { MERMAID_IMPORT_TOKEN } from './provide-content';

@Component({
  selector: 'analog-markdown',
  standalone: true,
  hostDirectives: [AnchorNavigationDirective],
  preserveWhitespaces: true,
  encapsulation: ViewEncapsulation.None,
  template: ` <div [innerHTML]="htmlContent()" [class]="classes()"></div> `,
})
export default class AnalogMarkdownComponent implements AfterViewChecked {
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mermaidImport = inject(MERMAID_IMPORT_TOKEN, {
    optional: true,
  });
  private mermaid: typeof import('mermaid') | undefined;
  private readonly renderedInputContent = signal<SafeHtml | string | undefined>(
    undefined,
  );
  private renderRequestId = 0;

  private contentSource: Signal<SafeHtml | string | undefined> = toSignal(
    this.getContentSource(),
  );
  readonly htmlContent: Signal<SafeHtml | string | undefined> = computed(() => {
    const inputContent = this.content();

    if (inputContent) {
      return this.renderedInputContent();
    }

    return this.contentSource();
  });
  readonly content: InputSignal<string | object | null | undefined> = input<
    string | object | null
  >();
  readonly classes: InputSignal<string> = input('analog-markdown');

  contentRenderer: ContentRenderer = inject(ContentRenderer);

  constructor() {
    effect(() => {
      const inputContent = this.content();
      if (typeof inputContent === 'string' && inputContent.length > 0) {
        void this.renderInputContent(inputContent);
        return;
      }

      if (inputContent) {
        this.renderedInputContent.set(
          this.sanitizer.bypassSecurityTrustHtml(String(inputContent)),
        );
        return;
      }

      this.renderedInputContent.set(undefined);
    });

    if (isPlatformBrowser(this.platformId) && this.mermaidImport) {
      // Mermaid can only be loaded on client side
      this.loadMermaid(this.mermaidImport);
    }
  }

  getContentSource(): Observable<SafeHtml | string> {
    return this.route.data.pipe(
      map<Data, string>((data) => data['_analogContent'] ?? ''),
      switchMap((contentString) => this.renderContent(contentString)),
      map((content) => this.sanitizer.bypassSecurityTrustHtml(content)),
      catchError((e) => of(`There was an error ${e}`)),
    );
  }

  async renderContent(content: string): Promise<string> {
    const rendered = await this.contentRenderer.render(content);
    return rendered.content;
  }

  private async renderInputContent(content: string): Promise<void> {
    const requestId = ++this.renderRequestId;
    const rendered = await this.renderContent(content);
    if (requestId === this.renderRequestId) {
      this.renderedInputContent.set(
        this.sanitizer.bypassSecurityTrustHtml(rendered),
      );
    }
  }

  ngAfterViewChecked(): void {
    this.contentRenderer.enhance();
    this.zone.runOutsideAngular(() => this.mermaid?.default.run());
  }

  private loadMermaid(mermaidImport: Promise<typeof import('mermaid')>) {
    this.zone.runOutsideAngular(() =>
      // Wrap into an observable to avoid redundant initialization once
      // the markdown component is destroyed before the promise is resolved.
      from(mermaidImport)
        .pipe(takeUntilDestroyed())
        .subscribe((mermaid) => {
          this.mermaid = mermaid;
          this.mermaid.default.initialize({ startOnLoad: false });
          // Explicitly running mermaid as ngAfterViewChecked
          // has probably already been called
          this.mermaid?.default.run();
        }),
    );
  }
}
