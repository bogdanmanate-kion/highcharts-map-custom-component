import { Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapConfig } from '../map-component/map-component.component';

@Inject({ providedIn: 'root' })
export class MapService {
  currentMapConfig = new BehaviorSubject({});

  loadMap(config: MapConfig) {
    // do some preprocessing
    this.currentMapConfig.next(config);
  }
}
