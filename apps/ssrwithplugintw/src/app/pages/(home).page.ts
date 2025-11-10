import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'ssrwithplugintw-home',

  imports: [AnalogWelcomeComponent],
  template: ` <ssrwithplugintw-analog-welcome /> `,
})
export default class HomeComponent {}
