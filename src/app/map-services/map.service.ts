import {Inject} from '@angular/core';
import {Subject} from 'rxjs';
import {MapConfig} from '../map-component/map-component.component';
import HC_Data from 'highcharts/modules/data.src';
import * as Highcharts from 'highcharts/highmaps.src';
import {GeoJSON} from 'highcharts/highmaps';
import * as topojson from "topojson-client";
HC_Data(Highcharts);

@Inject({providedIn: 'root'})
export class MapService {
    currentMapConfig = new Subject<any>();
    private mapRepository = 'https://code.highcharts.com/mapdata/';

    async loadMap(config: MapConfig) {
        const mapURL = this.constructMapURL(config);
        fetch(mapURL)
            .then(response => response.json())
            .then(mapData => {
                this.currentMapConfig.next(mapData);
            });
    }

    private constructMapURL(config: MapConfig) {
        switch (config.drillDown) {
            case 'country': {
                return this.mapRepository + `countries/${config.mapISOName}/${config.mapISOName}-all.topo.json`;
            }
            case 'continent': {
                return this.mapRepository + `custom/${config.mapISOName}.topo.json`;
            }
            case 'world': {
                return this.mapRepository + `custom/world-continents.topo.json`
            }
        }

    }
}
