'use strict';

// Co;lors for History trend chart
var colorSeries = ['rgba(0, 104, 179,0.5)',
    'rgba(213,112,42,0.5)',
    'rgba(129,189,74,0.5)',
    'rgba(235,177,0,0.5)',
    'rgba(139,60,199,0.5)'
];
var darkColorSeries = ['rgba(0, 104, 179,1)',
    'rgba(213,112,42,1)',
    'rgba(129,189,74,1)',
    'rgba(235,177,0,1)',
    'rgba(139,60,199,1)'
];

function getCurrentYearMonth() {
    var currentDate = new Date();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return {
        "year": year.toString(),
        "month": (month < 10 ? '0' + month.toString() : month.toString())
    }
}
var curKPIChart;
var curYearMonth = getCurrentYearMonth();
var currentMonth = curYearMonth.month;
var currentYear = curYearMonth.year;
var nbKPI = 3;
var monthButtonSelected;
var yearButtonSelected;
var yearPrefix = 'switch_year_';
var monthPrefix = 'switch_month_';
var unsetcolor = '#fff';
var darkunsetcolor = '#ddd';
var red = 'rgb(220,134,134)';
var darkred = 'rgb(172,104,104)';
var green = 'rgb(165,220,134)';
var darkgreen = 'rgb(130,172,106)';
var fontColor = "rgb(31,78,121)";
var gridColor = "rgb(31,78,121)";
var gridColorLight = "rgba(31,78,121,0.3)";
var font = 'Segoe UI SemiBold';
var legends = ["Incidents DSI", "Incidents SAFRAN", "Incidents ATOS"];
var param = {
    "spListName": 'KPISandBox',
    "titlePostFix": '-qrqc-sb1',
    "spListeUrl": '/snm/dsi/pdp',
    "spListItemTitle": undefined,
    "spScriptbase": '/snm/_layouts/15/',
    "canvasId": 'canvasWheelChart',
    "year": currentYear,
    "month": currentMonth,
    "defaultNbDataSet": nbKPI,
    "name": 'S',
    "options": {
        "dataSetLabel": legends,
        "bdColor": gridColor,
        "fontColor": fontColor,
        "colors": [unsetcolor, red, green],
        "hColors": [darkunsetcolor, darkred, darkgreen],
        "options": {
            "layout": {
                "padding": {
                    "left": 0,
                    "right": 0,
                    "top": 0,
                    "bottom": 0
                }
            }
        }
    }
};
var computedData;
var labels = [];

$(document).ready(function() {
    $('#title').text(currentYear + '/' + currentMonth);
    param.spListItemTitle = currentYear + '-' + currentMonth + param.titlePostFix;

    // Create QRQC WheelChart
    curKPIChart = new SAESPWheelChart(param);
    curKPIChart.setUpdateHandler(function() {
        curKPIChart.save();
    });
    // Load QRQC WheelChart data from SP List
    curKPIChart.load(function() {
        //console.log("curKPIChart loaded...");
        curKPIChart.show();
        curKPIChart.loadTrend(LoadHistoyGraph);
    });

    InitDateMenu();
    SetLegend();
});

function SetLegend() {
    var lgd = '<b>L&eacute;gende:</b> de l&quot;ext&eacute;rieur vers l&quot;int&eacute;rieur : ' +
        '<ul style="margin: initial;">';
    for (var t in legends) {
        lgd += '<li>' + legends[t] + '</li>';
    }
    lgd += '</ul>';

    $('#legend').css("margin-left", 10);
    $('#legend').html(lgd);
}

function InitDateMenu() {
    createMenu('year', $('#yearMenu'), [2017, 2018], 2018, yearPrefix, 'SelectYear');
    yearButtonSelected = $('#' + yearPrefix + currentYear);
    createMenu('month', $('#monthMenu'), ['Janvier', 'F&eacute;vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'D&eacute;cembre'], 'Janvier', monthPrefix, 'SelectMonth');
    monthButtonSelected = $('#' + monthPrefix + currentMonth);
    SetYear(currentYear);
    SetMonth(currentMonth);
}

function LoadHistoyGraph(data, minDate, maxDate) {
    if (minDate != -1 && maxDate != -1) {
        var startYear = parseInt(minDate.toString().substring(0, 4));
        var endYear = parseInt(maxDate.toString().substring(0, 4));
        var startMonth = parseInt(minDate.toString().substring(4, 6));
        var endMonth = parseInt(maxDate.toString().substring(4, 6));
        var nbYear = endYear - startYear + 1;
        var period = {
            "startYear": startYear,
            "endYear": endYear,
            "startMonth": startMonth,
            "endMonth": endMonth,
            "nbYear": nbYear,
            "nbMonth": (nbYear == 1 ? endMonth - startMonth + 1 : (nbYear == 2 ? (12 - startMonth + 1) + endMonth : (12 - startMonth + 1) + (12 * nbYear - 2) + endMonth))
        };


        //console.log("trend loaded... " + JSON.stringify(period));

        var chartData = [];
        for (var i = 0; i < period.nbMonth; i++) {
            var ty = period.startYear + Math.trunc((period.startMonth + i - 1) / 12);
            var tm = (period.startMonth + i) % 12;
            if (tm == 0) tm = 12;
            if (tm < 10) tm = '0' + tm;
            var formatter = new Intl.DateTimeFormat("fr", { month: "short" });
            var monthDateText = formatter.format(new Date(ty, tm - 1, 1));
            labels.push(ty + ' ' + monthDateText);
            var date = ty.toString() + tm.toString();
            chartData.push(data[date]);
            //console.log('y=' + ty + ' tm=' + tm);
            //console.log('date=' + date + ' data[date]=' + data[date]); --> -->
            //console.log('labels[' + i + ']=' + labels[i]);
            //console.log('chartData[' + i + ']=' + chartData[i]);
        }
        computedData = new Array(chartData[0].length);
        for (var i = 0; i < chartData[0].length; i++) computedData[i] = new Array(chartData.length);

        chartData.forEach(function(kpiTabByMonth, monthIndex, chartData) {
            if (kpiTabByMonth != undefined) {
                kpiTabByMonth.forEach(function(kpiByDayTab, kpiIndex, kpiTab) {

                    var valUndef = 0;
                    var valIncident = 0;
                    var valNoIncident = 0;
                    kpiByDayTab.forEach(function(val, dayIndex, kpiByDayTab) {
                        switch (val) {
                            case 0: // undef
                                valUndef++;
                                break;
                            case 1: // incident
                                valIncident++;
                                break;
                            case 2: // no incident
                                valNoIncident++;
                                break;
                        }
                    });
                    //console.log('chartData.forEach(' + monthIndex + ', '+kpiIndex+')');
                    computedData[kpiIndex][monthIndex] = valIncident;
                });
            }

        });


        //console.log('comp data=' + JSON.stringify(computedData));
        //console.log('labels=' + labels);


        var ctx = document.getElementById('lineChart').getContext('2d');
        Chart.defaults.global.defaultFontColor = fontColor;
        Chart.defaults.global.defaultFontFamily = font;
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: legends[0],
                    fill: false,
                    backgroundColor: colorSeries[0],
                    borderColor: darkColorSeries[0],
                    pointBackgroundColor: colorSeries[0],
                    pointBorderColor: darkColorSeries[0],
                    pointBorderWidth: 3,
                    data: computedData[0]
                }, {
                    label: legends[1],
                    fill: false,
                    backgroundColor: colorSeries[3],
                    borderColor: darkColorSeries[3],
                    pointBackgroundColor: colorSeries[3],
                    pointBorderColor: darkColorSeries[3],
                    pointBorderWidth: 3,
                    data: computedData[1]
                }, {
                    label: legends[2],

                    fill: false,
                    backgroundColor: colorSeries[4],
                    borderColor: darkColorSeries[4],
                    pointBackgroundColor: colorSeries[4],
                    pointBorderColor: darkColorSeries[4],
                    pointBorderWidth: 3,
                    data: computedData[2]
                }]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{

                        gridLines: {
                            color: gridColor,
                            lineWidth: 3,
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: gridColorLight,
                        }
                    }]
                },
                legend: {
                    display: true,
                    labels: {
                        font: font,
                        fontColor: fontColor
                    }
                }
            }
        });
    }
}

function createMenu(type, parent, values, selectedValue, prefix, handlerName) {
    for (var i = 0; i < values.length; i++) {
        var index;
        switch (type) {
            case 'month':
                if (i + 1 < 10) {
                    index = '0' + (i + 1);
                } else {
                    index = i + 1;
                }
                break;
            case 'year':
                index = values[i];
                break;
        }
        var checked;
        if (values[i] == selectedValue) {
            checked = " checked"
        } else {
            checked = ""
        }
        parent.append(('<input  id="' + prefix + index + '" type="radio" value="' + values[i] + '" name="' + prefix + 'radio"  onclick="' + handlerName + '(&quot;' +
            index + '&quot;)"' + checked + '/>'));

        parent.append($('<label for="' + prefix + index + '">' + values[i] + '</label>'));
    }
}

function SetYear(year) {
    yearButtonSelected = $('#' + yearPrefix + year);
    yearButtonSelected.prop('checked', true);
    currentYear = year;
}

function SelectYear(year) {
    SetYear(year);
    reload();
}

function SetMonth(month) {
    monthButtonSelected = $('#' + monthPrefix + month);
    monthButtonSelected.prop('checked', true);
    currentMonth = month;
}

function SelectMonth(month) {
    SetMonth(month);
    reload();
}

function reload() {
    var graphListItemTitle = currentYear + '-' + currentMonth + param.titlePostFix;
    curKPIChart.destroy();
    param.spListItemTitle = graphListItemTitle;
    param.year = currentYear;
    param.month = currentMonth;

    curKPIChart = new SAESPWheelChart(param);
    curKPIChart.setUpdateHandler(function() {
        curKPIChart.save();
    });

    $('#title').text(currentYear + '/' + currentMonth);
    curKPIChart.load(function() {
            // Load success Handler
            //console.log("curKPIChart reloaded...");
            curKPIChart.show();
        },
        function() {
            // Load failed handler
        });
}