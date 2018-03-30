//
// see https://msdn.microsoft.com/fr-fr/library/office/hh185011(v=office.14).aspx
// for explanations about SharePoint Javascript API
//
'use strict';


function SAESPWheelChart(p) {
    var me = this;
    //canvasId, spListeUrl, spListName, spListItemTitle, spScriptbase, 
    //year, month, defaultNbDataSet, titlePostFix, name, options
    this.dataId = -1;
    this.options = p.options || -1;
    this.name = p.name || "";
    this.titlePostFix = p.titlePostFix || "";
    this.year = p.year || -1;
    this.month = p.month || -1;
    this.defaultNbDataSet = p.defaultNbDataSet || -1;
    this.updateHandler = -1;
    this.loadHandler = -1;
    this.loadErrorHandler = -1;
    this.canvasId = p.canvasId;
    this.spListName = p.spListName;
    this.spListItemTitle = p.spListItemTitle || -1;
    this.spScriptbase = p.spScriptbase || -1;
    this.siteUrl = p.spListeUrl || -1;
    if (this.siteUrl == -1 || this.spScriptbase == -1 || this.spListItemTitle == -1) {
        console.error('spListName, spListItemTitle and spScriptbase must be provided!');
        alert('spListName, spListItemTitle and spScriptbase must be provided!');
        return null;
    }
    //var scriptbase = "/snm/_layouts/15/";
    var runtimeLib = 'SP.Runtime.js';
    var spLib = 'SP.js';


    function SAESPinitSPLibAndLoadScript(loadHandler) {
        if (!SAESPWheelChart.prototype.SPScriptLoaded && !SAESPWheelChart.prototype.SPScriptIsLoading) {
            SAESPWheelChart.prototype.SPScriptIsLoading = true;
            $.getScript(me.spScriptbase + runtimeLib,
                function() {
                    $.getScript(me.spScriptbase + spLib, loadHandler);
                }
            );
        } else if (SAESPWheelChart.prototype.SPScriptLoaded) {
            loadHandler();
        } else {
            var del = 500;
            console.warn('SAESPinitSPLibAndLoadScript waiting ' + del + 'ms...');
            setTimeout(function() {
                SAESPinitSPLibAndLoadScript(loadHandler);
            }, del);
        }
    }

    this.setUpdateHandler = function(handler) {
        this.updateHandler = handler || -1;
    }

    this.getCanvas = function() {
        return (this.chart == undefined ? null : this.chart.canvas);
    }

    this.load = function(loadHandler, loadErrorHandler, siteUrl, spListName, spListItemTitle) {
        this.loadHandler = loadHandler || -1;
        this.loadErrorHandler = loadErrorHandler || -1;
        this.siteUrl = siteUrl || this.siteUrl;
        this.spListName = spListName || this.spListName;
        this.spListItemTitle = spListItemTitle || this.spListItemTitle;
        SAESPinitSPLibAndLoadScript(function() {
            //console.log('load: siteUrl=' + me.siteUrl + ' siteName=' + me.spListName + ' spListItemTitle=' + me.spListItemTitle);
            try {
                SAESPWheelChart.prototype.SPScriptLoaded = true;
                var clientContext = new SP.ClientContext(me.siteUrl);

                var oList = clientContext.get_web().get_lists().getByTitle(me.spListName);
                var camlQuery = new SP.CamlQuery();
                camlQuery.set_viewXml("<View>" +
                    "<Query>" +
                    "<Where><Eq>" +
                    "<FieldRef Name='"+spListFieldNames.title+"' />" +
                    "<Value Type='Text'>" + me.spListItemTitle + "</Value>" +
                    "</Eq></Where>" +
                    "</Query>" +
                    "</View>");
                me.collListItem = oList.getItems(camlQuery);
                clientContext.load(me.collListItem, 'Include('+spListFieldNames.title+','+spListFieldNames.id+','+spListFieldNames.data+','+spListFieldNames.options+','+spListFieldNames.name+','+spListFieldNames.year+','+spListFieldNames.month+','+spListFieldNames.dimensions+','+spListFieldNames.unlock+')');

                clientContext.executeQueryAsync(Function.createDelegate(this, me.onLoadQuerySucces),
                    Function.createDelegate(this, me.onLoadQuerySucces));

            } catch (error) {
                var data = {
                    "name": scriptbase + spLib + " Loading error!",
                    "nbDataSet": 1,
                    "nbData": 1,
                    "error": true
                };
                me.chart = new SAEWheelChart(me.canvasId, data.name, data);
            }
        });
    }
    this.onLoadQuerySucces = function(sender, args) {
        //console.log('onLoadQuerySucces - ' + me.siteUrl + ' siteName=' + me.spListName + ' spListItemTitle=' + me.spListItemTitle);
        try {
            var listItemInfo = '';
            var listItemEnumerator = me.collListItem.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var chartData = -1;
                var values = '';
                var title;
                var year;
                var month;
                var nbDataset;
                var unlock;
                var id;
                var options;
                var oListItem = listItemEnumerator.get_current();
                title = oListItem.get_item(spListFieldNames.title);
                id = oListItem.get_id();

                if (title == me.spListItemTitle) {
                    chartData = oListItem.get_item(spListFieldNames.data);
                    options = oListItem.get_item(spListFieldNames.options);
                    try {
                        chartData = JSON.parse(chartData);
                    } catch (error) {}
                    try {
                        options = JSON.parse(options);
                    } catch (error) {}
                    if (options == null) options = me.options;
                    me.name = oListItem.get_item(spListFieldNames.name);
                    year = oListItem.get_item(spListFieldNames.year);
                    month = oListItem.get_item(spListFieldNames.month);
                    nbDataset = oListItem.get_item(spListFieldNames.dimensions);
                    unlock = oListItem.get_item(spListFieldNames.unlock);
                    me.dataId = id;

                    var currentDate = new Date();
                    var currentYear = currentDate.getFullYear();
                    var currentMonth = currentDate.getMonth() + 1;
                    unlock = (year == currentYear && month == currentMonth) || unlock;
                    var data = {
                        "date": [year, month - 1, 1],
                        "nbDataSet": nbDataset,
                        "locked": !unlock
                    };

                    if (chartData != null) {
                        data.values = chartData.values;
                    }
                    for (var prop in me.options) {
                        data[prop] = me.options[prop];
                        //console.log("me.option: "+prop, me.options[prop]);
                    }
                    for (var prop in options) {
                        data[prop] = options[prop];
                        //console.log("loaded option: "+prop, options[prop]);
                    }

                    me.chart = new SAEWheelChart(me.canvasId, me.name, data);
                    me.chart.setUpdateHandler(me.updateHandler);
                    //console.log('chart loaded');
                }
            }
        } catch (error) {
            console.error(error.message);
            alert('Erreur: Probleme avec la liste Sharepoint ' + me.siteUrl + '/[Listes]/' + me.spListName + ' ' + me.spListItemTitle+'\n'+error.message);
        }
        if (data == -1 || data == undefined) {
            me.onDataError('Erreur au chargement des donnes du graph : "' + me.spListItemTitle + '" from ' + me.siteUrl + '/' + me.spListName);
        } else if (me.loadHandler != -1) {
            me.loadHandler();
        }
    }

    this.onDataError = function(msg) {

        var response = confirm(msg + '\n' + 'Voulez-vous creer le Graphique?');
        if (response) {
            me.options.date = new Date(this.year, parseInt(this.month) - 1);
            me.options.nbDataSet = me.defaultNbDataSet;
            me.chart = new SAEWheelChart(me.canvasId, me.name, me.options);
            me.chart.setUpdateHandler(me.updateHandler);
            me.createAndSave();
            if (me.loadHandler != -1) {
                me.loadHandler();
            }
        } else {
            me.chart = null;
            if (me.loadErrorHandler != -1) {
                me.loadErrorHandler();
            }
        }
    }
    this.onLoadQueryError = function(sender, args) {
        me.onDataError('Request failed. ' + args.get_message());
    }
    this.save = function() {
        var clientContext = new SP.ClientContext(me.siteUrl);
        var oList = clientContext.get_web().get_lists().getByTitle(me.spListName);
        var oListItem = oList.getItemById(me.dataId);
        oListItem.set_item(spListFieldNames.data, me.chart.getData());
        var optionToSave = me.options;
        delete optionToSave.date;
        delete optionToSave.nbDataSet;
        oListItem.set_item(spListFieldNames.options, JSON.stringify(optionToSave));
        oListItem.update();
        clientContext.executeQueryAsync(Function.createDelegate(this, function(sender, args) {
                //console.log('saved');
            }),
            Function.createDelegate(this, this, function(sender, args) {
                alert('Erreur: ' + args.get_message() + '\n' + args.get_stackTrace());
                //console.log('save failed');
            })
        );
    }
    this.createAndSave = function() {
        var clientContext = new SP.ClientContext(me.siteUrl);
        var oList = clientContext.get_web().get_lists().getByTitle(me.spListName);
        var itemCreateInfo = new SP.ListItemCreationInformation();
        me.oListItem = oList.addItem(itemCreateInfo);
        var month = parseInt(me.month);
        me.oListItem.set_item(spListFieldNames.title, this.year + '-' + this.month + this.titlePostFix);
        me.oListItem.set_item(spListFieldNames.data, me.chart.getData());
        me.oListItem.set_item(spListFieldNames.month, month);
        me.oListItem.set_item(spListFieldNames.name, me.name);
        me.oListItem.set_item(spListFieldNames.dimensions, me.defaultNbDataSet);
        me.oListItem.set_item(spListFieldNames.year, parseInt(me.year));
        me.oListItem.set_item(spListFieldNames.unlock, false);
        if (me.options != -1) {
            var optionToSave = me.options;
            delete optionToSave.date;
            delete optionToSave.nbDataSet;
            me.oListItem.set_item(spListFieldNames.options, JSON.stringify(optionToSave));
        }

        me.oListItem.update();
        clientContext.load(me.oListItem);
        clientContext.executeQueryAsync(Function.createDelegate(this, function(sender, args) {
                //console.log('created');
                me.dataId = me.oListItem.get_id();

            }),
            Function.createDelegate(this, this, function(sender, args) {
                alert('Erreur: ' + args.get_message() + '\n' + args.get_stackTrace());
                //console.error('creation failed');
            })
        );
    }
    this.loadTrend = function(loadTrendHandler, siteUrl, spListName, spListItemTitle) {

        this.loadTrendHandler = loadTrendHandler || -1;
        this.siteUrl = siteUrl || this.siteUrl;
        this.spListName = spListName || this.spListName;
        this.spListItemTitle = spListItemTitle || this.spListItemTitle;
        SAESPinitSPLibAndLoadScript(function() {
            //console.log('loadTrend: siteUrl=' + me.siteUrl + ' siteName=' + me.spListName + ' spListItemTitle=' + me.spListItemTitle);
            try {
                SAESPWheelChart.prototype.SPScriptLoaded = true;
                var clientContext = new SP.ClientContext(me.siteUrl);

                var oList = clientContext.get_web().get_lists().getByTitle(me.spListName);
                var camlQuery = new SP.CamlQuery();


                camlQuery.Query = '<OrderBy><FieldRef Name="'+spListFieldNames.title+'"  Ascending="TRUE" /></OrderBy>';
                camlQuery.RowLimit = 100;
                me.collListItem = oList.getItems(camlQuery);

                clientContext.load(me.collListItem, 'Include('+spListFieldNames.title+','+spListFieldNames.id+','+spListFieldNames.data+','+spListFieldNames.options+','+spListFieldNames.name+','+spListFieldNames.year+','+spListFieldNames.month+','+spListFieldNames.dimensions+','+spListFieldNames.unlock+')');

                clientContext.executeQueryAsync(Function.createDelegate(this, me.onLoadTrendQuerySucces),
                    Function.createDelegate(this, me.onLoadTrendQuerySucces));

            } catch (error) {
                alert("Erreur: Probleme au chargement des donnes de la liste sharepoint pour la courbe de tendances " + me.siteUrl + '/[Listes]/' + me.spListName + ' ' + me.spListItemTitle);
            }
        });
    }
    this.onLoadTrendQuerySucces = function(sender, args) {
        //console.log('onLoadTrendQuerySucces - ' + me.siteUrl + ' siteName=' + me.spListName + ' spListItemTitle=' + me.spListItemTitle);
        var listItemInfo = '';
        try {
            var listItemEnumerator = me.collListItem.getEnumerator();

            var minDate = -1;
            var maxDate = -1;
            var data = {};

            while (listItemEnumerator.moveNext()) {

                var chartData = -1;
                var values = '';
                var title;
                var year;
                var month;
                var nbDataset;
                var unlock;

                var oListItem = listItemEnumerator.get_current();
                title = oListItem.get_item(spListFieldNames.title);
                if (RegExp('.*' + me.titlePostFix).test(title)) {
                    unlock = oListItem.get_item(spListFieldNames.unlock);
                    chartData = oListItem.get_item(spListFieldNames.data);
                    try {
                        chartData = JSON.parse(chartData);
                    } catch (error) {}

                    year = oListItem.get_item(spListFieldNames.year);
                    month = oListItem.get_item(spListFieldNames.month);
                    if (month < 10) month = '0' + month;
                    nbDataset = oListItem.get_item(spListFieldNames.dimensions);

                    var date = year.toString() + month.toString();
                    var dateIndex = parseInt(year + month);
                    if (minDate > dateIndex || minDate == -1) minDate = dateIndex;
                    if (maxDate < dateIndex || maxDate == -1) maxDate = dateIndex;
                    data[date] = chartData.values;
                    //console.log("trend data: " + monthDateText +' / '+dateIndex+ ' -> ' + JSON.stringify(chartData));
                    //console.log("title: " + title + ", year: " + year + ", month: " + month+", Debloquer: "+unlock);
                }


            }
            //console.log("minDate: " + minDate);
            //console.log("maxDate: " + maxDate);
            //console.log("trendLabels: " + trendLabels);
            //console.log("trendData: " + trendData);
        } catch (error) {
            alert('Erreur au chargement des donnees du graph : "' + me.spListItemTitle + '" depuis ' + me.siteUrl + '/' + me.spListName+'\n'+error.message);

        }
        if (me.loadTrendHandler != -1) {
            me.loadTrendHandler(data, minDate, maxDate);
        }
    }

    this.onDataTrendError = function(msg) {
        console.log('Error: ' + msg);
    }
    this.onLoadTrendQueryError = function(sender, args) {
        me.onDataError('Load Trend data Request failed. ' + args.get_message());
    }
    var spListFieldNames={
        "id": "Id",
        "title": "Title",
        "month": "Mois",
        "year": "Annee",
        "name": "Nom",
        "options": "Options",
        "data": "Donnees",
        "dimensions": "Dimensions",
        "unlock": "Debloquer"
    };
}
SAESPWheelChart.prototype.SPScriptLoaded = false;
SAESPWheelChart.prototype.SPScriptIsLoading = false;