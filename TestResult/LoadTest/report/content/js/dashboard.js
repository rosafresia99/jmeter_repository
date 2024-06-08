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

    var data = {"OkPercent": 80.35398230088495, "KoPercent": 19.646017699115045};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4952261306532663, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4527439024390244, 500, 1500, "Payouts_tr_CreateBatchPayout"], "isController": true}, {"data": [0.5649122807017544, 500, 1500, "Payouts_tr_ShowPayoutItemsDetails"], "isController": true}, {"data": [0.5521172638436482, 500, 1500, "Payouts_tr_ShowPayoutBatchDetails"], "isController": true}, {"data": [0.4733644859813084, 500, 1500, "HTTP Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1130, 222, 19.646017699115045, 715178.2504424778, 484, 5041872, 631.5, 4878842.4, 5041021.9, 5041347.69, 0.22348039266098302, 0.3897570898536539, 0.088670604635102], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Payouts_tr_CreateBatchPayout", 328, 24, 7.317073170731708, 267235.2896341464, 589, 5041872, 629.5, 1337.900000000001, 4477706.600000001, 5041495.68, 0.06488856180833344, 0.08607850094068632, 0.043440321873479175], "isController": true}, {"data": ["Payouts_tr_ShowPayoutItemsDetails", 285, 23, 8.070175438596491, 279510.8140350877, 484, 5041401, 518.0, 1086.4, 4867714.4999999935, 5041308.96, 0.056400641661194816, 0.09221052686065717, 0.01653947270644317], "isController": true}, {"data": ["Payouts_tr_ShowPayoutBatchDetails", 307, 25, 8.143322475570033, 261964.7654723127, 487, 5041383, 519.0, 1093.4, 2935271.5999998697, 5041153.24, 0.06074223449114232, 0.11589190474193058, 0.019801008526369648], "isController": true}, {"data": ["HTTP Request", 1070, 162, 15.14018691588785, 530444.7785046732, 484, 5041872, 624.5, 4464930.4, 4984626.65, 5041245.06, 0.21161417712146177, 0.3598115052279579, 0.08751913365452542], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 412)", 1, 0.45045045045045046, 0.08849557522123894], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 442; received: 410)", 1, 0.45045045045045046, 0.08849557522123894], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 312)", 1, 0.45045045045045046, 0.08849557522123894], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 106, 47.747747747747745, 9.380530973451327], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException", 1, 0.45045045045045046, 0.08849557522123894], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 441; received: 312)", 1, 0.45045045045045046, 0.08849557522123894], "isController": false}, {"data": ["429", 13, 5.8558558558558556, 1.1504424778761062], "isController": false}, {"data": ["429/Too Many Requests", 49, 22.07207207207207, 4.336283185840708], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 3, 1.3513513513513513, 0.26548672566371684], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException", 46, 20.72072072072072, 4.070796460176991], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1130, 222, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 106, "429/Too Many Requests", 49, "Non HTTP response code: java.net.SocketException", 46, "429", 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 3], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Payouts_tr_CreateBatchPayout", 21, 21, "Non HTTP response code: java.net.SocketException", 17, "429", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Payouts_tr_ShowPayoutItemsDetails", 17, 17, "Non HTTP response code: java.net.SocketException", 15, "429", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Payouts_tr_ShowPayoutBatchDetails", 22, 22, "Non HTTP response code: java.net.SocketException", 14, "429", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException", 1, "", "", "", ""], "isController": false}, {"data": ["HTTP Request", 1070, 162, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 106, "429/Too Many Requests", 49, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: The target server failed to respond", 3, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 440; received: 412)", 1, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 442; received: 410)", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
