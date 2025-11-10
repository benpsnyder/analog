import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'csrwithplugintw-home',

  imports: [AnalogWelcomeComponent],
  template: ` <csrwithplugintw-analog-welcome /> `,
})
export default class HomeComponent {}
