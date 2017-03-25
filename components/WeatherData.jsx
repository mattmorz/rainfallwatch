import React from 'react';
import xhr from 'xhr';
import moment from 'moment';
import ReactDOM from 'react-dom';

export default class WeatherData extends React.Component {

  filterTable(evt) {
    var filter, table, tr, td, i;
    filter = evt.target.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  render() {
      return (
        <div>
        <div className="form-group">
          <input type="text" className="form-control" id="searchKey" placeholder="Search Location here..." ref="searchInput" onKeyUp={this.filterTable} autoFocus />
        </div>
        <div className="table-responsive ">
          <table className="table table-bordered table-striped" id="myTable">
            <thead>
            <tr>
              <th>Location</th>
              <th>Latest Reading (Date & Time) </th>
              <th>Rainfall Value  </th>
              <th>Accumulated Rainfall in the last 24 hours</th>
              <th>Rainfall Intensity</th>
            </tr>
          </thead>
            <tbody>
              {this.props.devices.map(data =>
                <tr key={data.id}>
                  <td> {data.loc}, {data.mun}, {data.prov}</td>
                <td>
                  {data.latest_date != "No Data" ?
                    moment(data.latest_date).format('LLL'):
                    "No Data"
                  }
                </td>
                  <td>
                    {data.latest_data != "No Data" ?
                      data.latest_data+' mm/hr':
                      "No Data"
                    }
                  </td>
                  <td> {data.accum24}</td>
                  <td>
                    { data.latest_data <= 0 ?
                      "No Rainfall" :
                      data.latest_data > 0 && data.latest_data < 2.5 ?
                      "Light" :
                      data.latest_data > 2.5 && data.latest_data < 7.5 ?
                      "Moderate" :
                      data.latest_data > 7.5 && data.latest_data < 15 ?
                      "Heavy" :
                      data.latest_data > 15 && data.latest_data < 30 ?
                      "Intense" :
                      data.latest_data > 30 ?
                      "Torrential":
                      "No Data"
                    }
                  </td>
                </tr>
              )}
            </tbody>
        </table>
        </div>
        </div>
      )
  }//end render
}//end component
