import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ng-docs-description',
  standalone: true,
  template: `
    <p class="mt-3 max-w-2xl text-base text-muted-foreground">
      {{ description() }}
    </p>
  `,
})
export class DocsDescription {
  readonly description = input.required<string>();
}

@Component({
  selector: 'ng-docs-title',

  template: `
    <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
      {{ title() }}
    </h1>
  `,
})
export class DocsTitle {
  readonly title = input.required<string>();
}
