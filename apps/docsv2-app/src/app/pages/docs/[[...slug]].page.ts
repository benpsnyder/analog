import { Component, computed, inject, resource } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import {
  DocsProvider,
  DocsPage,
  DocsTitle,
  DocsDescription,
  DocsMd4xContentRendererService,
} from '@ng-docs/docs-angular';
import { HtmlContentComponent } from '@analogjs/content';

@Component({
  selector: 'app-docs-optional-catchall-page',
  template: `
    @let pageData = page.value();
    @if (pageData) {
      <ng-docs-page [page]="pageData" [toc]="pageData.toc ?? []">
        <ng-docs-title [title]="pageData.attributes.title" />
        <ng-docs-description
          [description]="pageData.attributes.description ?? ''"
        />
        <analog-html
          class="prose-docs max-w-none"
          [content]="pageData.content"
        />
      </ng-docs-page>
    }
  `,
  imports: [DocsPage, DocsTitle, DocsDescription, HtmlContentComponent],
})
export default class DocsOptionalCatchAllPageComponent {
  private readonly docsProvider = inject(DocsProvider);
  private readonly docsRenderer = inject(DocsMd4xContentRendererService);
  private readonly router = inject(Router);

  private routeUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    {
      initialValue: this.router.url,
    },
  );

  readonly slug = computed(() => this.routeUrl().split(/[?#]/, 1)[0]);
  private readonly source = this.docsProvider.getPage(this.slug);
  readonly page = resource({
    params: () => this.source.value(),
    loader: async ({ params }) => {
      if (!params || typeof params.content !== 'string') {
        return undefined;
      }

      const rendered = await this.docsRenderer.render(params.content);
      return {
        ...params,
        content: rendered.content,
        toc: rendered.toc,
      };
    },
  });
}
