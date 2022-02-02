import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MapConfig } from './map-component/map-component.component';
import { MapService } from './map-services/map.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  drillDownLevels = [
    { level: 0, key: 'world' },
    { level: 1, key: 'continent' },
    { level: 2, key: 'country' },
  ];

  selectedDrilldownLevel = this.drillDownLevels[0];

  mapISOName = '';
  constructor(private mapService: MapService) {}
  ngOnInit() {}

  goToMapHandler() {
    this.mapService.loadMap({
      drillDown: this.selectedDrilldownLevel.key,
      mapISOName: this.mapISOName,
    });
  }
}
