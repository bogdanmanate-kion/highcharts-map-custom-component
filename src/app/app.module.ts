import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MapComponent } from './map-component/map-component.component';
import { MapService } from './map-services/map.service';

@NgModule({
  imports: [BrowserModule, FormsModule, HighchartsChartModule],
  declarations: [AppComponent, MapComponent],
  providers: [MapService],
  bootstrap: [AppComponent],
})
export class AppModule {}
