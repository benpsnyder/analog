import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsLayout, DocsProvider } from '@ng-docs/docs-angular';
import type { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnalogJS',
    url: 'https://analogjs.org',
  },
};

@Component({
  selector: 'app-docs-index-page',
  imports: [RouterOutlet, DocsLayout],
  template: `
    <ng-docs-layout [navItems]="navItems">
      <router-outlet />
    </ng-docs-layout>
  `,
})
export default class DocsIndexPageComponent {
  private docsProvider = inject(DocsProvider);
  navItems = this.docsProvider.pageTree;
}
