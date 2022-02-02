import { Component, OnInit } from '@angular/core';
import proj4 from 'proj4';
import HC_Drilldown from 'highcharts/modules/drilldown';
import * as Highcharts from 'highcharts/highmaps';
import worldMap from '@highcharts/map-collection/custom/world-continents.geo.json';
import { MapService } from '../map-services/map.service';

HC_Drilldown(Highcharts);

export interface MapConfig {
  drillDown: string;
  mapISOName: string;
}

@Component({
  selector: 'app-map-component',
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.css'],
})
export class MapComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  chartOptions: Highcharts.Options;
  isMapLoaded = false;

  constructor(private mapService: MapService) {}

  ngOnInit() {
    this.mapService.currentMapConfig.subscribe((mapConfig) => {
      console.log('Load Map', mapConfig);

      this.isMapLoaded = true;
    });

    const data = Highcharts.geojson(worldMap).map((m) => {
      m.mapLocation =
        'custom/' + m.properties['name'].toLowerCase().replace(' ', '-');
      m.drilldown = m.properties['hc-key'];
      return m;
    });

    this.chartOptions = {
      chart: {
        proj4: proj4,
        events: {
          drilldown: (e) => {
            if (!e.seriesOptions) {
              const chart = e.target,
                mapKey = (e.point as any).drilldown,
                mapLocation = (e.point as any).mapLocation;

              // Handle error, the timeout is cleared on success
              let fail = setTimeout(() => {
                if (!Highcharts.maps[mapKey]) {
                  chart.showLoading(
                    '<i class="icon-frown"></i> Failed loading ' + e.point.name
                  );
                  fail = setTimeout(() => {
                    chart.hideLoading();
                  }, 1000);
                }
              }, 3000);

              // Show the spinner
              chart.showLoading(
                '<i class="icon-spinner icon-spin icon-3x"></i>'
              ); // Font Awesome spinner

              // Load the drilldown map
              fetch(
                'https://code.highcharts.com/mapdata/' +
                  mapLocation +
                  '.geo.json'
              )
                .then((response) => response.json())
                .then((mapData) => {
                  const drillDownData = Highcharts.geojson(mapData);
                  Highcharts.maps[mapKey] = drillDownData;

                  drillDownData.forEach((d, i) => {
                    d.mapLocation =
                      'countries/' +
                      d.properties['hc-key'] +
                      '/' +
                      d.properties['hc-key'] +
                      '-all';
                    d.drilldown = d.properties['hc-key'];
                  });

                  // Hide loading and add series
                  chart.hideLoading();
                  clearTimeout(fail);
                  chart.addSeriesAsDrilldown(e.point, {
                    name: e.point.name,
                    mapData: Highcharts.maps[mapKey],
                    data: [
                      ['de', 30],
                      ['ro', 5],
                    ],
                    type: 'map',
                    dataLabels: {
                      enabled: true,
                      format: '{point.name}',
                    },
                  });
                  if (mapKey.indexOf('de') != -1) {
                    chart.addSeries(
                      {
                        type: 'mappoint',
                        name: 'Active Locations',
                        data: [
                          {
                            name: 'Frankfurter Werk',
                            lat: 50.11,
                            lon: 8.68,
                          },
                          {
                            name: 'Berliner Werk',
                            lat: 52.52,
                            lon: 13.4,
                          },
                        ],
                      },
                      true
                    );

                    // chart.addSeriesAsDrilldown(e.point, {
                    //     type: 'mappoint',
                    //     name: 'Active Locations',
                    //     data: [{
                    //         name: 'Frankfurter Werk',
                    //         lat: 50.11,
                    //         lon: 8.68,
                    //     },
                    //         {
                    //             name: 'Berliner Werk',
                    //             lat: 52.52,
                    //             lon: 13.4,
                    //         }]
                    // })
                  }
                });
            }
          },
          drillup: function () {
            this.setTitle(null, { text: '' });
          },
        },
      },
      tooltip: { enabled: false },
      title: {
        text: '',
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          alignTo: 'spacingBox',
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        floating: true,
        symbolHeight: 50,
        itemMarginTop: 25,
        itemMarginBottom: 25,
        enabled: true,
      },
      colorAxis: [
        {
          stops: [
            [0, '#f2f2f2'],
            [1, '#4d4d4d'],
          ],
          min: 0,
        },
      ],
      series: [
        {
          type: 'map',
          name: 'Ship-tos',
          joinBy: ['hc-key'],
          states: {
            hover: {
              enabled: true,
              fillColor: '#9c9a9a',
            },
          },
          color: '#f2f2f2',
          dataLabels: {
            enabled: false,
          },
          allAreas: true,
          mapData: data,
          data: [
            ['as', 50],
            ['eu', 1],
          ],
        },
        // should be added only for country view
        // {
        //     type: 'mappoint',
        //     name: 'Locations',
        //     showInLegend: false,
        //     color: Highcharts.getOptions().colors[4],
        //     marker: {
        //         fillColor: '#4d4d4d',
        //         radius: 15,
        //         states: {
        //             hover: {
        //                 enabled: false,
        //                 radius: 10,
        //             },
        //         },
        //     },
        //     dataLabels: {
        //         enabled: true,
        //         format: '{point.name}',
        //     },
        //     events: {
        //         click: (event) => {
        //             console.log('Show the truck list for:', event.point.options.name);
        //         },
        //     },
        //     data: [
        //         {
        //             name: 'Frankfurter Werk',
        //             lat: 50.11,
        //             lon: 8.68,
        //         },
        //         {
        //             name: 'Berliner Werk',
        //             lat: 52.52,
        //             lon: 13.4,
        //         },
        //         {
        //             name: 'Italia spedition',
        //             lat: 41.9,
        //             lon: 12.48,
        //         },
        //     ],
        // },
      ],
      drilldown: {
        activeDataLabelStyle: {
          color: '#FFFFFF',
          textDecoration: 'none',
          textOutline: '1px #000000',
        },
        drillUpButton: {
          relativeTo: 'spacingBox',
          position: {
            x: 0,
            y: 60,
          },
        },
      },
    };
  }
}
