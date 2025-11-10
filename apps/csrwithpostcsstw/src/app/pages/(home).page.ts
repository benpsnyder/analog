import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'csrwithpostcsstw-home',

  imports: [AnalogWelcomeComponent],
  template: ` <csrwithpostcsstw-analog-welcome /> `,
})
export default class HomeComponent {}
