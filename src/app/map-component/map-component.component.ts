import { Component, OnInit } from '@angular/core';
import HC_Drilldown from 'highcharts/modules/drilldown.src';
import HC_Data from 'highcharts/modules/data.src';
import * as Highcharts from 'highcharts/highmaps.src';
import { MapService } from '../map-services/map.service';
import * as topojson from "topojson-client";

HC_Drilldown(Highcharts);
HC_Data(Highcharts);

export interface MapConfig {
  drillDown: string;
  mapISOName: string;
}

const drilldown = async function (e) {
  if (!e.seriesOptions) {
    console.log('this',this)
    const chart = this,
        mapKey = `countries/${e.point.drilldown}-all`,
        mapLocation = e.point.mapLocation;
    // Handle error, the timeout is cleared on success
    let fail = setTimeout(() => {
      if (!Highcharts.maps[mapKey]) {
        chart.showLoading(`
                    <i class="icon-frown"></i>
                    Failed loading ${e.point.name}
                `);
        fail = setTimeout(() => {
          chart.hideLoading();
        }, 1000);
      }
    }, 3000);

    // Show the Font Awesome spinner
    chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i>');

    // Load the drilldown map
    const topology = await fetch(
        `https://code.highcharts.com/mapdata/${mapLocation}.topo.json`
    ).then(response => response.json());

    const data = Highcharts.geojson(topology);

    // Set a non-random bogus value
    data.forEach((d, i) => {
      d.mapLocation =  'countries/' +
          d.properties['hc-key'] +
          '/' +
          d.properties['hc-key'] +
          '-all';
      d.drilldown = d.properties['hc-key'];
    });

    // Apply the recommended map view if any
    chart.mapView.update(
        Highcharts.merge(
            { insets: undefined },
            topology.objects.default['hc-recommended-mapview']
        ),
        false
    );

    // Hide loading and add series
    chart.hideLoading();
    clearTimeout(fail);
    chart.addSeriesAsDrilldown(e.point, {
      name: e.point.name,
      data,
      type: 'map',
      dataLabels: {
        // enabled: true,
        format: '{point.name}'
      }
    });

    if (mapKey.indexOf('de') != -1) {
      chart.addSeries(
          {
            type: 'mappoint',
            name: 'Active Locations',
            data: [
              {
                name: 'Frankfurter Werk',
                key: 'DE-BW',
                lat: 50.11,
                lon: 8.68,
              },
              {
                name: 'Berliner Werk',
                key: 'DE-BW',
                lat: 52.52,
                lon: 13.4,
              },
            ],
            marker: {
              radius: 8
            },
            dataLabels: {
              align: 'center',
              verticalAlign: 'buttom',
            },
            events: {
              click: function (event) {
                console.log('event',event)
              }
            },
            animation: false,
            tooltip: {
              pointFormat: '{point.name}'
            }
          },
          true
      );

    }
  }
};

// On drill up, reset to the top-level map view
const drillup = function (e) {
  if (e.seriesOptions.custom && e.seriesOptions.custom.mapView) {
    e.target.mapView.update(e.seriesOptions.custom.mapView, false);
  }
};

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
    this.mapService.currentMapConfig.subscribe((topology) => {
      const data = Highcharts.geojson(topology);
      // Set drilldown pointers
      data.forEach((d, i) => {
        d.mapLocation = 'custom/' + d.properties['name'].toLowerCase().replace(' ', '-');
        d.drilldown = d.properties['hc-key'];
      });

      this.initMapOptions(data);
      this.isMapLoaded = true;

    });

  }

  protected initMapOptions(data: any) {

    const mapView =  {projection: {
        name: 'WebMercator',
        projectedBounds: 'world'
      }};

    this.chartOptions = {
      chart: {
        events: {
          drilldown,
          drillup
        },
      },
      tooltip: { enabled: false },
      title: {
        text: '',
      },
      mapView,
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
          name: 'Basemap',
          type: 'map',
          mapData: data,
          borderColor: '#A0A0A0',
          nullColor: 'rgba(200, 200, 200, 0.3)',
          showInLegend: false,
          allAreas: true,
          custom: {
            mapView
          },
        },
        {
          type: 'map',
          name: 'World',
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
      ],
      drilldown: {
        activeDataLabelStyle: {
          color: '#FFFFFF',
          textDecoration: 'none',
          textOutline: '1px #000000',
        },
        allowPointDrilldown: true,
        breadcrumbs: {
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
