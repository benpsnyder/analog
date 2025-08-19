import type { AngularRenderer } from '@storybook/angular';
import { setProjectAnnotations as originalSetProjectAnnotations } from '@storybook/angular/dist/client/index.js';
import type {
  NamedOrDefaultProjectAnnotations,
  NormalizedProjectAnnotations,
} from 'storybook/internal/types';

export function setProjectAnnotations(
  projectAnnotations:
    | NamedOrDefaultProjectAnnotations<AngularRenderer>
    | NamedOrDefaultProjectAnnotations<AngularRenderer>[],
): NormalizedProjectAnnotations<AngularRenderer> {
  // Ensure projectAnnotations is always an array for consistent handling
  const annotationsArray = Array.isArray(projectAnnotations)
    ? projectAnnotations
    : [projectAnnotations];

  return originalSetProjectAnnotations(
    annotationsArray,
  ) as NormalizedProjectAnnotations<AngularRenderer>;
}
