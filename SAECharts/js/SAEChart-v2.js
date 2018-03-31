//
// SAE Wheel Chart Class
// option content:
//  date : month and year used for the WheelChart
//  nbDataSet: number of data serie
//  dataSetLabel: label of dataset (it's an array)
//  nbData : nb values for each dataset
//  values : chart data array - if provided, nbDataSet and nbData given are overwritten
//  error: if true print error message
// 
//  fontFamily 
//  fontFamilyLight 
//  bdColor
//  bdWidth
//  hBdColor
//  hBdWidth
//  fontColor
//  colors
//  hColors
//  cutoutPercentage
//  animateScale
//  
// Example:
//        var c = new SAEWheelChart('myChart', 'P', {
//            date: new Date(),
//            values: [[1,0,0], [2,0,0]],
//            dataSetLabel: ["juin","juillet"]
//        });

function SAEWheelChart(canvasId, name, options) {

    this._init = function(canvasId, name, options) {
        //console.log('SAEWheelChart->_init: ' + canvasId + ' ' + name);
        this.date = -1;
        this.name = name || "";
        this.canvasId = this.canvasId || canvasId || -1;
        if (this.canvasId == -1) {
            throw "canvasId must be given!"
        }
        this.bubbleId = this.canvasId + '-popup'
        this.options = options || -1;
        if (this.options != -1) {
            this.locked = options.locked || false;
            this.date = options.date || -1;
            this.nbDataSet = options.nbDataSet || -1;
            this.nbData = options.nbData || -1;
            this.values = options.values || -1;
            this.error = options.error || false;
            this.labels = options.dataSetLabel || -1;
            this.chartOptions = options.options || -1;
            this.fontFamily = options.fontFamily || SAEWheelChart.prototype.fontFamily;
            this.fontFamilyLight = options.fontFamilyLight || SAEWheelChart.prototype.fontFamilyLight;
            this.bdColor = options.bdColor || SAEWheelChart.prototype.bdColor;
            this.bdWidth = options.bdWidth || SAEWheelChart.prototype.bdWidth;
            this.hBdColor = options.hBdColor || SAEWheelChart.prototype.hBdColor;
            this.hBdWidth = options.hBdWidth || SAEWheelChart.prototype.hBdWidth;
            this.fontColor = options.fontColor || SAEWheelChart.prototype.fontColor;
            this.colors = options.colors || SAEWheelChart.prototype.colors;
            this.hColors = options.hColors || SAEWheelChart.prototype.hColors;
            this.cutoutPercentage = options.cutoutPercentage || SAEWheelChart.prototype.cutoutPercentage;
            this.animateScale = options.animateScale || SAEWheelChart.prototype.animateScale;
            //console.log("SAEChart options: ", this.chartOptions);
        } else {
            throw "options date or values, or dataSet + nbDataSet must be given!"
        }
        if (this.date == -1 && this.values == -1 && this.nbDataSet == -1 && this.nbData == -1) {
            throw "options date or values, or dataSet + nbDataSet must be given!"
        }

        if (this.values == -1 && this.date != -1 && this.nbData == -1) {
            // number of day in the month
            if (!(this.date instanceof Date)) {
                this.date = new Date(this.date[0], this.date[1], this.date[2]);
            }
            this.nbData = daysInMonth(this.date);
        } else if (this.values !== -1 && this.date != -1) {
            if (!(this.date instanceof Date)) {
                this.date = new Date(this.date[0], this.date[1], this.date[2]);
            }
        }

        if (this.values == -1 && this.date == -1) {
            this.values = new Array(this.nbDataSet);
            for (var i = 0; i < this.nbDataSet; i++) {
                var data = new Array(this.nbData);
                data = data.fill(0, 0, this.nbData);
                this.values[i] = data;
            }
        } else if (this.values != -1) {
            this.nbData = this.values[0].length;
            this.nbDataSet = this.values.length;
        } else {
            this.values = new Array(this.nbDataSet);
            this.values = new Array(this.nbDataSet);
            for (var i = 0; i < this.nbDataSet; i++) {
                var data = new Array(this.nbData);
                data = data.fill(0, 0, this.nbData);
                this.values[i] = data;
            }
        }
        this.data = [];
        this.bgColor = [];
        this.hBgColor = [];
        this.theData = [];

        for (var i = 0; i < this.nbDataSet; i++) {
            this.theData[i] = [];
            this.hBgColor[i] = [];
            this.bgColor[i] = [];
        }
        for (var i = 0; i < this.nbData; i++) {
            this.data = this.data.concat(1);
            for (var j = 0; j < this.nbDataSet; j++) {
                this.bgColor[j] = this.bgColor[j].concat(this.colors[this.values[j][i]]);
                this.hBgColor[j] = this.hBgColor[j].concat(this.hColors[this.values[j][i]]);
                this.theData[j] = this.theData[j].concat(this.values[j][i]);
            }
        }

        this.dataSet = new Array(this.nbDataSet);
        for (var i = 0; i < this.nbDataSet; i++) {
            this.dataSet[i] = {
                hoverBackgroundColor: this.hBgColor[i],
                backgroundColor: this.bgColor[i],
                borderColor: this.bdColor,
                borderWidth: this.bdWidth,
                hoverBorderColor: this.hBdColor,
                hoverBorderWidth: this.hBdWidth,
                data: this.data,
            };
        }


        //
        // Create an extension of Doughnut Chart
        //
        Chart.defaults.derivedDoughnut = Chart.defaults.doughnut;

        var custom = Chart.controllers.doughnut.extend({
            draw: function(ease) {
                // Call super method first
                //console.log('SAEWheelChart-> draw: '+me.canvasId+' '+me.name);
                Chart.controllers.doughnut.prototype.draw.call(this, ease);

                // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
                var meta = this.getMeta();
                var pt0 = meta.data[0];
                me.innerRadius = meta.controller.chart.innerRadius;
                var outerRadius = meta.controller.chart.outerRadius;
                var innerRadius = me.innerRadius;
                var ctx = this.chart.chart.ctx;
                ctx.save();
                ctx.mozImageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.webkitImageSmoothingEnabled = true;
                ctx.msImageSmoothingEnabled = true;
                ctx.imageSmoothingEnabled = true;
                //var imagedata = ctx.getImageData(0, 0, 100, 100);
                // use the putImageData function that illustrates how putImageData works
                //ctx.putImageData(imagedata, 150, 0, 50, 50, 25, 25);

                var midWdth = parseInt((ctx.canvas.offsetWidth / 2).toFixed(0));
                var midHght = parseInt((ctx.canvas.offsetHeight / 2).toFixed(0));
                if (me.error) {
                    var textHeight = 14;
                    ctx.font = textHeight + "px " + me.fontFamily;
                    var txt = meta.controller.chart.options.text;
                    var size = ctx.measureText(txt).width.toFixed(0);
                    ctx.fillStyle = 'white';
                    ctx.clearRect(midWdth - size / 2, midHght - textHeight / 2, size, textHeight);
                    ctx.textAlign = "center";
                    ctx.fillStyle = SAEWheelChart.prototype.red;
                    ctx.fillText(txt, midWdth, midHght);
                } else {
                    var fontSize = innerRadius;
                    ctx.fillStyle = me.fontColor;
                    ctx.font = fontSize / 6 + "pt " + me.fontFamilyLight;
                    ctx.textAlign = "center";
                    ctx.fillText('|', midWdth, outerRadius - innerRadius + fontSize / 3 + 5);
                    ctx.textAlign = "left";
                    ctx.fillText(' 1', midWdth, outerRadius - innerRadius + fontSize / 3 + 5);
                    ctx.textAlign = "right";
                    ctx.fillText(me.nbData + ' ', midWdth, outerRadius - innerRadius + fontSize / 3 + 5);

                    if (this.chart.currentIndex != undefined) {
                        ctx.font = fontSize + "pt " + me.fontFamily;
                        ctx.textAlign = "center";
                        ctx.fillText(this.chart.currentIndex + 1, midWdth, midHght);
                    } else {
                        // draw the name of the chart
                        ctx.font = fontSize + "pt " + me.fontFamily;
                        ctx.textAlign = "center";
                        var txt = meta.controller.chart.options.text;
                        //var size = ctx.measureText(txt);
                        ctx.fillText(txt, midWdth, midHght);
                    }
                    if (me.date != -1) {
                        if (me.date instanceof Date) {} else {
                            me.date = new Date(me.date[0], me.date[1], me.date[2]);
                        }
                        var formatter = new Intl.DateTimeFormat("fr", { /*day: "numeric",*/ month: "short", year: "numeric" });
                        var txt = formatter.format(me.date);
                        var margin = fontSize / 10;
                        var libFontSize = innerRadius / 6;
                        ctx.font = libFontSize + "pt " + me.fontFamily;
                        ctx.fillStyle = me.fontColor;
                        ctx.textAlign = "center";
                        //var size = ctx.measureText(txt);
                        ctx.fillText(txt, midWdth, midHght + fontSize / 2 + libFontSize + margin);
                        //console.log('ctx.fillText(' + txt + ',' + midWdth + ', ' + (midHght + fontSize / 2 + libFontSize + margin) + ') midHght=' + midHght);
                    }

                }
                ctx.restore();
            }
        });


        // Stores the controller so that the chart initialization routine can look it up with
        // Chart.controllers[type]
        Chart.controllers.derivedDoughnut = custom;

        this.canvas = document.getElementById(this.canvasId);
        injectCSS(this, '#' + this.canvasId + '{transition: opacity 5s ease-out;}');
        this.canvasPopup = document.getElementById(this.bubbleId);
        var ctx = this.canvas.getContext('2d');
        var chartOptions = {
            "text": this.name,
            "cutoutPercentage": this.cutoutPercentage,
            "animation": {
                "animateScale": this.animateScale
            }
        };
        if (this.chartOptions != -1) {
            for (prop in this.chartOptions) {
                chartOptions[prop] = this.chartOptions[prop];
            }
        }
        var onHover = function(evt) {
            //console.log('SAEWheelChart->onHover: '+me.canvasId+' '+me.name);
            this.currentDataSet = undefined;
            this.chart.currentIndex = undefined;
            this.chart.currentDataSetIndex = undefined;
            var activePoints = this.getElementsAtEvent(evt);
            if (activePoints != undefined && activePoints.length > 0) {
                var dataSet = this.getDatasetAtEvent(evt);
                if (dataSet != undefined) {
                    var dataSetIndex = dataSet[0]._datasetIndex;
                    var index = activePoints[dataSetIndex]._index;
                    this.chart.currentDataSet = dataSetIndex;
                    this.chart.currentIndex = index;
                }
            }

        };
        chartOptions["tooltips"] = { "enabled": false };
        chartOptions["onHover"] = onHover;
        /*for (prop in chartOptions) {
            console.log("SAEChartOptions: " +prop+' = '+ chartOptions[prop]);
        }*/

        var chart = new Chart(ctx, {
            type: 'derivedDoughnut',
            // The data for our dataset
            data: {
                datasets: this.dataSet
            },
            // Configuration options go here
            options: chartOptions,


        });
        this.chart = chart;
        chart.theData = this.theData;
        var me = this;

        // add click evt on canvas
        this.canvas.onclick = function(evt) {
            me.onClick(evt);
        }

        this.onClick = function(evt) {
            if (!me.locked) {
                var activePoints = this.chart.getElementsAtEvent(evt);
                var dataSet = this.chart.getDatasetAtEvent(evt);
                if (dataSet.length > 0) {
                    var dataSetIndex = dataSet[0]._datasetIndex;
                    var index = activePoints[dataSetIndex]._index;
                    var d = me.chart.data.datasets[dataSetIndex];
                    this.chart.theData[dataSetIndex][index]++;
                    this.chart.theData[dataSetIndex][index] = this.chart.theData[dataSetIndex][index] % 3;
                    d.backgroundColor[index] = this.colors[this.chart.theData[dataSetIndex][index]];
                    d.hoverBackgroundColor[index] = this.hColors[this.chart.theData[dataSetIndex][index]];
                    //console.log('1-->'+JSON.stringify(me.chart.theData));
                    this.chart.update();
                    if (this.updateHandler != -1) {
                        this.updateHandler();
                    }
                }
            }
        }
    }
    this.setUpdateHandler = function(handler) {
        //console.log('SAEWheelChart->setUpdateHandler: ' + this.canvasId + ' ' + this.name);
        this.updateHandler = handler;
    }
    this.getData = function() {
        return '{"values":' + JSON.stringify(this.chart.theData) + "}";
    }

    this.updateHandler = -1;

    function daysInMonth(theDate) {
        if (theDate instanceof Date) {
            return new Date(theDate.getYear(), theDate.getMonth() + 1, 0).getDate();
        } else {
            return new Date(theDate[0], theDate[1], theDate[2]).getDate();
        }
    }

    function DateToArray(date) {
        var a = new Array(3);
        a[0] = date.getFullYear();
        a[1] = date.getMonth();
        a[2] = date.getDate();
        return a;
    }

    this._init(canvasId, name, options);

    var me = this;

    //console.log('set id='+$(this.grandParent).attr("id")+' to class='+$(this.grandParent).attr("class"));
    //
    // tooltip mgnt
    //
    this.grandParent = $(me.canvas).parent().parent();
    $(this.grandParent).attr("id", $(this.grandParent).attr("id") || this.canvasId + '_p');
    this.grandParentId = $(this.grandParent).attr("id");

    this.hoverEvent = function(event) {
        //console.log('hover '+me.canvasId+' currentDataSet: '+me.chart.currentDataSet);
        event.preventDefault();
        var x = event.x - this.offsetLeft + window.scrollX + 10;
        var y = event.y - this.offsetTop + window.scrollY + 10;
        var fontSize = parseInt(me.innerRadius / 6);
        var margin = parseInt(fontSize / 2);
        var font = 'font-family:' + me.fontFamily + '; font-size: ' + fontSize + 'pt;';
        var padding = 'padding:' + margin + 'px ' + margin + 'px;';
        var xy = 'left: ' + x + 'px; top: ' + y + 'px;';
        if (me.chart.currentDataSet != undefined) {
            $(me.canvas).parent().attr("tooltip-val", me.labels[me.chart.currentDataSet]);
            display = 'display:block;';
        } else {
            display = 'display:none;';
        }

        style.innerHTML = '#' + me.grandParentId + '> *[tooltip]:hover::after {' + display + xy + font + padding + '}';
        //console.log(style.innerHTML);
    }

    var style = document.createElement('style');
    document.head.appendChild(style);

    /*var staticStyle = document.createElement('style');
    document.head.appendChild(staticStyle);*/

    //staticStyle.innerHTML = SAEWheelChart.tootipStyleCSS;
    injectCSS(this, SAEWheelChart.prototype.tootipStyleCSS);

    if (this.labels != -1) {
        $.map($(me.canvas).parent().parent().children('*'), function(elt) {
            var attr = elt.getAttribute('tooltip');
            if (attr) {
                //console.log('elt: ' + elt.localName + ' id: ' + $(elt).attr('id') + ' class: ' + $(elt).attr('class'));
                elt.addEventListener('mouseover', me.hoverEvent);
                elt.addEventListener('mousemove', me.hoverEvent);
            }
        });

    } else {
        //style.innerHTML = '*[tooltip]:hover::after {opacity: 0;}';
        console.log('no lable for chart: ' + this.canvasId);
    }

    function injectCSS(platform, css) {
        // http://stackoverflow.com/q/3922139
        var style = platform._style || document.createElement('style');
        if (!platform._style) {
            platform._style = style;
            css = '/* SAEWheelChart.js */\n' + css;
            style.setAttribute('type', 'text/css');
            document.head.appendChild(style);
        }

        style.appendChild(document.createTextNode(css));
    }

    this.show = function() {
        $(this.canvas).css('opacity', 1);
    }
    this.hide = function() {
        $(this.canvas).css('opacity', 0);
    }
    this.destroy = function() {
        this.chart.destroy();
    }
}
//
// Init default SAEWheelChart Class values
//
SAEWheelChart.prototype.fontFamily = "Segoe UI Semibold";
SAEWheelChart.prototype.fontFamilyLight = "Segoe UI Light";
SAEWheelChart.prototype.white = 'rgba(255,255,255,1)';
SAEWheelChart.prototype.grey = 'rgba(200,200,200,1)';
SAEWheelChart.prototype.red = 'rgba(200,0,0,1)';
SAEWheelChart.prototype.green = 'rgba(0,200,0,1)';
SAEWheelChart.prototype.darkred = 'rgba(150,0,0,1)';
SAEWheelChart.prototype.darkgreen = 'rgba(0,150,0,1)';
SAEWheelChart.prototype.darkgrey = 'rgba(60,60,60,1)';
SAEWheelChart.prototype.bdColor = SAEWheelChart.prototype.darkgrey;
SAEWheelChart.prototype.bdWidth = 2;
SAEWheelChart.prototype.hBdColor = SAEWheelChart.prototype.darkgrey;
SAEWheelChart.prototype.hBdWidth = 2;
SAEWheelChart.prototype.fontColor = SAEWheelChart.prototype.darkgrey;
SAEWheelChart.prototype.colors = [SAEWheelChart.prototype.white, SAEWheelChart.prototype.red, SAEWheelChart.prototype.green];
SAEWheelChart.prototype.hColors = [SAEWheelChart.prototype.grey, SAEWheelChart.prototype.darkred, SAEWheelChart.prototype.darkgreen];
SAEWheelChart.prototype.animateScale = true;
SAEWheelChart.prototype.cutoutPercentage = 40;

SAEWheelChart.prototype.tootipStyleCSS = '*[tooltip] {position: relative;}' +
    '*[tooltip]::after {' +
    'content: attr(tooltip-val);' +
    'border-radius: 15px;' +
    'opacity: 0;' +
    'display: none;' +
    'transition: opacity 15s ease-in-out;' +
    'position: absolute; ' +
    'pointer-events: none;    ' +
    'color: rgba(255,255,255,1);' +
    'background: rgba(0,0,0,0.8);' +
    'border: 0px solid #c0c0c0;' +
   /* 'box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.4);' +*/
    'z-index: 2;' +
    '}' +
    '*[tooltip]:hover::after {' +
    'opacity: 1;' +
    '}';