import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import WeatherData from './WeatherData.jsx';
import moment from 'moment';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);


export default class Weather extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     all_device: [],
     date_requested : moment().format('LLL'),
     isLoaded: false,
     reloadTime: ""
   }
 }

 autoRefresh() {
      //extract minute from the time the page loaded
      var ago = moment().format('m');
      var minut = parseInt(ago);
      var timeRef = 900000;
      var that = this;
      if (minut <= 15){
        timeRef = parseInt(15 - minut) * 60000;
      }
      else if(minut > 15 && minut <= 30){
        timeRef = parseInt(30 - minut) * 60000;
      }
      else if(minut > 30 && minut <= 45){
        timeRef = parseInt(45 - minut) * 60000;
      }else{
        timeRef = parseInt(60 - minut) * 60000;
      }

      var finalT = timeRef + 60000;

      setTimeout("location.reload(true);", finalT);
      var left = parseInt(finalT/60000);
      //console.log(ago+'----'+minut+'---'+ left +'---' +timeRef)
      that.setState({
        reloadTime : left
      })
 }

 getData(){
   //console.log(this.state.isLoaded);

   var url;
   var device_id =  ['611','1564','1565','1561','712','779','118','707','706','711','155','713','710','607','609','592','739','589','608','606','569','570','612','587','567','591','564','563','566','565','568','588','1575','1567','1577','1568','152','154','153','1203','1204','708','709','1576','780','781','1573','1574','782','121','120','1562','1386','1563'];
   var that = this;
   var map;
   var stations = new L.LayerGroup();

   if(!this.state.isLoaded){
     console.log("loaded");
     var LeafIcon = L.Icon.extend({
      options: {
        iconSize:     [15, 15],
        iconAnchor:   [0, 0],
        popupAnchor:  [8, 0]
      }
      });
     var no_data = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/no_data.png")});
     var light = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/light.png")});
     var moderate = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/moderate.png")});
     var heavy = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/heavy.png")});
     var intense = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/intense.png")});
     var torrential = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/torrential.png")});
     var no_rain = new LeafIcon({iconUrl: require("../stylesheets/bootstrap/img/no_rainfall.png")});


     map = L.map("map", {
          minZoom: 2,
          maxZoom: 22,
          layers: [
              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}),
              stations
          ],
          attributionControl: false,
      });
      map.setView([9.13, 125.74],10);

      var legend = L.control({position: 'topright'});

       legend.onAdd = function (map) {
           var div = L.DomUtil.create('div', 'info legend');
           var imglegend = require("../stylesheets/bootstrap/img/legend.PNG");
           div.innerHTML =  '<img src="'+imglegend +'" height="144px" width="159px"/>'
           return div;
       };
       legend.addTo(map);

       map.on('popupclose', function(e){
         var cont = document.getElementById("container");
         cont.innerHTML = "<br/><p class='text-center'>Loading...</p>";
       });

       this.setState({
         isLoaded: true
       })

    }

   //stations.removeFrom(map);


   //console.log(hold_data);
   for(var h =0; h < device_id.length;h++){
         stations.clearLayers();
         url = 'https://cors-anywhere.herokuapp.com/http://fmon.asti.dost.gov.ph/home/index.php/api/data/'+device_id[h];
          xhr({
            url: url
            },
            function (err, data) {
              var finalData=JSON.parse(data.body);
              var loc = finalData[0].location;
              var mun = finalData[0].municipality;
              var prov = finalData[0].province;
              var data = finalData[0].data;
              var posx = finalData[0].posx;
              var posy = finalData[0].posy;
              var iid =  finalData[0].dev_id;
              var hold_data = [];

              //check if there is data if none, input No Data
              if (data.length > 0){
                var accum = 0.0;
                //get the latest date and time, split it and get only the time
                var fDate = data[0].dateTimeRead;
                var gTime = fDate.split(' ');
                var tTime = gTime[1].slice(0, 5);

                //multiply by 4 the latest rainfall value for mm/hr
                var fRain_value = parseFloat(data[0].rain_value * 4);

                var lDateIndex;
                var lDate ;
                var dates = [];


                //loop through the dates and push it to dates array
                for(var i = 0; i < data.length; i++){
                     if (i>0){
                         var dd =  data[i].dateTimeRead.split(' ');
                         var rtime = dd[1].slice(0, 5);
                         dates.push(rtime)
                     }
                }

                //find the index of the time with same value as the latest time to get 24 hour duration
                //add 2 because we skip the latest value on the loop above and we'll it as length
                lDateIndex = parseInt(dates.indexOf(tTime) + 2);

                //if less than 24hours use all values
                if (lDateIndex < 2){
                  lDateIndex = dates.length
                }

                //console.log(lDateIndex +'--' + loc+ '--'+dates.length);

                //create an array to store values
                var dateVal = []

                //loop thru data and use lDateIndex as lenght as it has the last values for 24 hours
                for (var j=0; j < lDateIndex;j++){
                    //compute the Accumulated values for 24 hours
                   accum +=parseFloat(data[j].rain_value);
                   //push the date and time, and value to array
                   dateVal.push([moment(data[j].dateTimeRead).format('LLL'), data[j].rain_value]);
                 }

                 //create and object containg the attributes needed in plotting the points
                var data_all_device = {
                  latest_date :fDate,
                  latest_data : fRain_value,
                  accum24: accum.toFixed(2) + " mm",
                  mun :mun,
                  loc:loc,
                  prov: prov,
                  id: iid,
                  posx: posx,
                  posy: posy,
                  data24: dateVal.reverse()
                }
                //push the values array
                hold_data.push(data_all_device)
              }else{
                var data_all_device = {
                  latest_date :"No Data",
                  latest_data : "No Data",
                  accum24: "No Data",
                  mun :mun,
                  loc:loc,
                  prov: prov,
                  id: iid,
                  posx: posx,
                  posy: posy,
                  data24: []
                }
                //push the values array
                hold_data.push(data_all_device)
              }//else

              //add all the values it the state this is needed fro the tabular view
              that.setState({
                all_device: that.state.all_device.concat(data_all_device)
              })

              //plot all the points/stations using Leaflet marker
              hold_data.map(data =>
                  L.marker([data.posx, data.posy], {
                    radius: 100,
                    //evaluate to determine its intensity based on its latest data
                    icon:  data.latest_data <= 0 ?
                       no_rain:
                      data.latest_data > 0 && data.latest_data < 2.5 ?
                      light :
                      data.latest_data > 2.5 && data.latest_data < 7.5 ?
                      moderate:
                      data.latest_data > 7.5 && data.latest_data < 15 ?
                      heavy:
                      data.latest_data > 15 && data.latest_data < 30 ?
                      intense :
                      data.latest_data > 30 ?
                      torrential:
                      no_data
                  }).bindPopup(
                    //add popup containing the data attributes and graph it
                    '<div id="container" style="min-width: 600px; height: 450px; margin: 0 auto"><br/><p class="text-center">Loading...</p></div>'
                    +'<br/>Accumulated Rainfall in the last 24hrs: <strong>'+data.accum24+'</strong>'
                    +'<br/>Maximum Rainfall Value: <strong><span id="max"></span></strong>'
                    +'<br/>Latest Rainfall Value: <strong>'
                    +(data.latest_data != "No Data" ? data.latest_data+' mm/hr':'No Data')
                    +'</strong>'
                    ,{
                      maxWidth: "600px",
                      height: "450px"
                    }
                    ).on('click', function() {
                      //add event on click to display the Highcharts graph

                      //create a container/array which holds the values for rainfall intensity and Accumulated values
                      var accum = [];
                      var rain = [];
                      var accumVal = 0.0;

                      //map the data and push it to the arrays
                      data.data24.map(function(d, i){
                          var rainVal = d[1] * 4;
                          accumVal +=parseFloat(d[1]);
                          accum.push([d[0], accumVal]);
                          rain.push([d[0], rainVal]);
                      });
					  
						var lentick = parseFloat(data.data24.length/5);
                        
						//Highcharts configuration
                        var options = {
                        chart: {
                            renderTo: 'container',
                            type: 'line',
                            width: 600,
                            height: 450,
                            alignTicks: false
                        },
                        credits: false,
                        title: {
                        text: data.loc+', '+ data.mun+', '+ data.prov
                        },
                        subtitle: {
                            text: 'Source: <a href="http://fmon.asti.dost.gov.ph/weather/predict/" target="_blank">PREDICT, DOST</a>',
                            x: -20
                        },
                        xAxis: {
                            type: 'category',
                            minTickInterval: Math.round(lentick,1),
                            tickInterval: Math.round(lentick,1),
                            labels: {
                                padding: 5,
                                align: "center",
                                style: {
                                    fontSize: "10px"
                                }
                            },
                            reversed: false,
                        },
                        yAxis: [{ //primary y axis
                            min: 0,
                            max: 100,
                            tickInterval:20,
                            title: {
                                text: "Rainfall Intensity, mm/hr."
                            },
                            reversed: !0,
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: "#808080"
                            }],
                            plotBands: [{
                                    color: '#86e3e7',
                                    from: 0,
                                    to: 2.5,
                                    label: {
                                        text: 'Light',
                                        align: 'left',
                                        x: 10
                                    }
                                }, {
                                    color: '#8aa7fd',
                                    from: 2.5,
                                    to: 7.5,
                                    label: {
                                        text: 'Moderate',
                                        align: 'left',
                                        x: 10
                                    }
                                }, {
                                    color: '#8686dc',
                                    from: 7.5,
                                    to: 15,
                                    label: {
                                        text: 'Heavy',
                                        align: 'left',
                                        x: 10
                                    }
                                }, {
                                    color: '#fed88d',
                                    from: 15,
                                    to: 30,
                                    label: {
                                        text: 'Intense',
                                        align: 'left',
                                        x: 10
                                    }
                                }, {
                                    color: '#fe9686',
                                    from: 30,
                                    to: 50000,
                                    label: {
                                        text: 'Torrential',
                                        align: 'left',
                                        x: 10
                                    }
                                }

                            ]
                        }, { //secondary y axis
                            title: {
                                text: "Accumulated Rainfall, mm"
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: "#808080"
                            }],
                            opposite: !0,
                            min: 0,
                            max: 200,
                            tickInterval:40,
                            startOnTick: false,
                            endOnTick: false,
                            reversed: !1
                        }],
                        gridLineDashStyle: 'solid',
                        series: [{
                            name: "Rainfall Intensity",
                            data: rain,
                            tooltip: {
                                valueSuffix: "  mm/hr."
                            },
                            color: "#0000ff"
                        }, {
                            name: "Accumulated Rainfall",
                            data: accum,
                            tooltip: {
                                valueSuffix: " mm"
                            },
                            yAxis: 1,
                            color: "#ff0000"
                        }]
                    }; //options

                    //add Highcharts
                    var chart = Highcharts.chart('container', options);

                    //determine the max rain value
                    var max = chart.yAxis[0].dataMax,
                        arr = [],
                        myIndex = [],
                        s = chart.series[0],
                        len = s.data.length;

                    //getting the latest index with max value in y-axis
                    for (var j = 0; j < len; j++) {
                        arr[j] = chart.series[0].data[j].y;
                        //if found push the index
                        if (arr[j] === max) {
                            myIndex.push(j);
                        }
                    }

                    //bind the div which store the value
                    var max_div = document.getElementById("max");

                    //add data handler in case of no data
                    if(myIndex.length > 0 && max > 0.0){
                      var maxIndex = Math.max.apply(Math, myIndex);
                      var realDate = rain[maxIndex][0];
                      max_div.innerHTML = parseFloat(max)+' mm on '+ realDate;
                    }else if(max == 0){
                      max_div.innerHTML = 'No Rainfall'
                    }else{max_div.innerHTML = 'No Data' }

                    })
                    .addTo(stations).bindTooltip(data.loc,{
                    permanent: true,
                    offset : [15,10],
                    opacity : 0.8,
                    direction	: "right"
                  }).openTooltip()
           )//endmap

           //clear array to remove existing station and avoid adding it again
           hold_data = [];

         });//endxhr
   }//endfor

 }

 componentDidMount() {
   var that = this;

   this.getData();
   setInterval(function(){
     that.autoRefresh();
   }, 1000);


 };//endcomponentdidmount

  render() {
    const customStyle = {
      height: "800px",
      width: "100%",
      margin: "0 auto"
    }
    const mapStyle = {
      height: "100%",
      width: "100%"
    }
     var dataLength = this.state.all_device.length;
      return (
        <div>
          <div className="container-fluid">
             <div className="row">
             <div className="col-sm-12">
               <div className="alert alert-info" role="alert">
                <span className="glyphicon glyphicon-info-sign" aria-hidden="true"> </span>
                Data below is <strong>requested on {this.state.date_requested} </strong> from <a href="http://fmon.asti.dost.gov.ph/weather/predict/" target="_blank">DOST ASTI</a> Server.
                The page will refresh in <strong>{this.state.reloadTime < 2 || this.state.reloadTime > 15 ? 'less than a' : this.state.reloadTime} minute(s) </strong> to load new data. Please wait until all stations were loaded.
                </div>
                <p>{
                    dataLength == 0 ? 'Getting data from ASTI Server...please wait.' :
                    dataLength == 1 ? 'Data from '+dataLength+' station has been loaded.':
                    dataLength > 1 && dataLength < 54 ? 'Data from '+dataLength+' out of 54 stations have been loaded.':
                    'Data from all available stations have been loaded. You can view it in Tabular View Panel also.'
                  }
                </p>
               <ul className="nav nav-tabs" role="tablist">
                 <li role="presentation" className="active"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Map View</a></li>
                  <li role="presentation"><a href="#home" aria-controls="#home" role="tab" data-toggle="tab">Tabular View</a></li>
               </ul>

               <div className="tab-content">
                 <div role="tabpanel" className="tab-pane active" id="profile" style={customStyle}><br/>
                 <div className='map' id="map" style={mapStyle}></div>
                 </div>
                 <div role="tabpanel" className="tab-pane" id="home"><br/>
                 <WeatherData devices={this.state.all_device}/>
                 </div>
                </div>

             </div>
            </div>
          </div>
        </div>

      );
   }
}
