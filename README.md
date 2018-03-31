# saechart
js package allowing to manage WheelChart with historical view according to SharePoint javascript WS API.

## features
+ display chart
+ update chart values
+ save / load chart data from SharePoint List
+ load all list chart data in order to create an historical trend view

## improvement items
It may be usefull to add the following features :
+ optimize responsive behaviour (specially when making winfow smaller) with css properties
+ add a export to excel service
+ add a zoom and print service
+ add a way to add values in WheelChart cells in oder to manage more in detail the KPI threshold
+ add ability to add comments on a given chart cell

## used framework
+ JQuery https://jquery.com/
+ MS Ajax
+ SharePoint 2013 javascript https://msdn.microsoft.com/fr-fr/library/jj193034.aspx
+ ChartJS http://www.chartjs.org/

## package content
```
js/                                  jquery, MS Ajax, and ChartJS javascript lib
SAECharts/
 └─── stylesheets/                   exemple of css
 └─── js/
      └─── SAEChart-v2.js            customisation of Doughnut chart from ChartJS to create SAEWheelChart class
      └─── SAEWheelChartInSP-v2.js   link SAEWheelChart with SharePoint persistence ability

SANDBOX_QRQC_KPI/                    Implementation example
 └─── HTML_TO_ADD_IN_SP_PAGE.html    htlm code to be inserted in SharePoint ScriptEditor Webpart in the final end user SharePoint page
 └─── style.css                      css used by SharePoint page
 └─── SANDBOX_QRQC_KPI.js            script to manage the SharePoint end user page behavior
```
## SharePoint List structure
Column | Type | Mandatory | Name in API | Values | Usage
-- | -- | -- | -- | -- | --
Titre | One text line | YES | **Title** | used as an index to select chart data
Mois | Choice | | Mois | {1, 2, .. 12} | defines the month of the chart
Annee | Choice | | Annee | {2017, .. 2019...} | defines the year of the chart
Nom | One text line | | Nom | | | defines the letters in the center of the chart
Options | Several text lines | | Options | [json data] | options of the chart
Donnees | Several text lines | | Donnees | [json data] | data series of the chart
Dimensions | Choice | | Dimensions | {1, 2, ..5} | number of data series of the chart
Debloquer | Yes/No | | Debloquer | {Yes/No} -> {true, false} | allows to unlock update of the chart when the current month is not the month of the Chart. No by default

