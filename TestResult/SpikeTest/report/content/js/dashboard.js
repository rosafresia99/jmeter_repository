/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 57.36434108527132, "KoPercent": 42.63565891472868};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3787878787878788, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.39622641509433965, 500, 1500, "Payouts_tr_CreateBatchPayout"], "isController": true}, {"data": [0.532608695652174, 500, 1500, "Payouts_tr_ShowPayoutItemsDetails"], "isController": true}, {"data": [0.5612244897959183, 500, 1500, "Payouts_tr_ShowPayoutBatchDetails"], "isController": true}, {"data": [0.31048387096774194, 500, 1500, "HTTP Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 258, 110, 42.63565891472868, 1526330.7558139535, 489, 5041872, 1133.0, 4985432.1, 5041033.9, 5041865.51, 0.05102472681994125, 0.09772245668435788, 0.016289007464245112], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Payouts_tr_CreateBatchPayout", 53, 4, 7.547169811320755, 297562.75471698114, 605, 5041872, 1022.0, 1747.6000000000004, 5041647.5, 5041872.0, 0.010485166456963338, 0.014013709355142479, 0.0069840574775063505], "isController": true}, {"data": ["Payouts_tr_ShowPayoutItemsDetails", 46, 3, 6.521739130434782, 329430.847826087, 489, 5041401, 554.5, 1088.8, 5041250.1, 5041401.0, 0.009103414591863248, 0.01537708656199455, 0.002634354710888416], "isController": true}, {"data": ["Payouts_tr_ShowPayoutBatchDetails", 49, 3, 6.122448979591836, 125291.32653061225, 489, 5041023, 532.0, 1084.0, 532877.5, 5041023.0, 0.009695171923098688, 0.01809555456333935, 0.0032554260315761857], "isController": true}, {"data": ["HTTP Request", 248, 100, 40.32258064516129, 1438886.6451612904, 489, 5041872, 1087.5, 4954424.6, 5018587.7, 5041711.06, 0.04904702423002105, 0.093058825391506, 0.016013790062815787], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 412)", 1, 0.9090909090909091, 0.3875968992248062], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 442; received: 410)", 1, 0.9090909090909091, 0.3875968992248062], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 312)", 1, 0.9090909090909091, 0.3875968992248062], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 67, 60.90909090909091, 25.968992248062015], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 441; received: 312)", 1, 0.9090909090909091, 0.3875968992248062], "isController": false}, {"data": ["429", 3, 2.727272727272727, 1.1627906976744187], "isController": false}, {"data": ["429/Too Many Requests", 27, 24.545454545454547, 10.465116279069768], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 2, 1.8181818181818181, 0.7751937984496124], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException", 7, 6.363636363636363, 2.7131782945736433], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 258, 110, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 67, "429/Too Many Requests", 27, "Non HTTP response code: java.net.SocketException", 7, "429", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Payouts_tr_CreateBatchPayout", 4, 4, "Non HTTP response code: java.net.SocketException", 3, "429", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Payouts_tr_ShowPayoutItemsDetails", 3, 3, "Non HTTP response code: java.net.SocketException", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Payouts_tr_ShowPayoutBatchDetails", 3, 3, "429", 2, "Non HTTP response code: java.net.SocketException", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request", 248, 100, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 67, "429/Too Many Requests", 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 2, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 412)", 1, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 442; received: 410)", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
