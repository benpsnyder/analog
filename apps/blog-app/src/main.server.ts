import 'zone.js/node';
import '@angular/platform-server/init';
import { render } from '@benpsnyder/analogjs-esm-router/server';

import { config } from './app/app.config.server';
import { AppComponent } from './app/app.component';

export default render(AppComponent, config);
