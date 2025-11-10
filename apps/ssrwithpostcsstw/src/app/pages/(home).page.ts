import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'ssrwithpostcsstw-home',

  imports: [AnalogWelcomeComponent],
  template: ` <ssrwithpostcsstw-analog-welcome /> `,
})
export default class HomeComponent {}
