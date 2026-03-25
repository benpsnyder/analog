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
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { from } from 'rxjs';

import { AnchorNavigationDirective } from './anchor-navigation.directive';
import { MERMAID_IMPORT_TOKEN } from './provide-content';

@Component({
  selector: 'analog-html',
  standalone: true,
  hostDirectives: [AnchorNavigationDirective],
  preserveWhitespaces: true,
  encapsulation: ViewEncapsulation.None,
  template: ` <div [innerHTML]="htmlContent()" [class]="classes()"></div> `,
})
export default class AnalogHtmlComponent implements AfterViewChecked {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mermaidImport = inject(MERMAID_IMPORT_TOKEN, {
    optional: true,
  });
  private mermaid: typeof import('mermaid') | undefined;

  readonly content: InputSignal<string | null | undefined> = input<
    string | null
  >();
  readonly classes: InputSignal<string> = input('analog-html');
  readonly htmlContent: Signal<SafeHtml | string | undefined> = computed(() =>
    this.content()
      ? this.sanitizer.bypassSecurityTrustHtml(this.content() as string)
      : undefined,
  );

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.mermaidImport) {
      this.loadMermaid(this.mermaidImport);
    }
  }

  ngAfterViewChecked(): void {
    this.zone.runOutsideAngular(() => this.mermaid?.default.run());
  }

  private loadMermaid(mermaidImport: Promise<typeof import('mermaid')>) {
    this.zone.runOutsideAngular(() =>
      from(mermaidImport)
        .pipe(takeUntilDestroyed())
        .subscribe((mermaid) => {
          this.mermaid = mermaid;
          this.mermaid.default.initialize({ startOnLoad: false });
          this.mermaid?.default.run();
        }),
    );
  }
}
