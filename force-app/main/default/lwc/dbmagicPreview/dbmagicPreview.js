import { LightningElement, api, track } from 'lwc';

const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    HBAR: 'horizontalBar',
    RADAR: 'radar',
    DOUGHNUT: 'doughnut',
    PIE: 'pie',
    POLAR_AREA: 'polarArea',
    BUBBLE: 'bubble',
    SCATTER: 'scatter'
}

const METRIC_TYPES = {
    NUMBER: 'number',
    CURRENCY: 'currency',
    PERCENT: 'percent'
}

const STRINGS = {
    PERCENT_FIXED: 'percent-fixed'
}

export default class LwccChart extends LightningElement {
    colours = ['#1b96ff', '#ad7bee', '#ff538a', '#ff5d2d', '#ca8501', '#06a59a', '#7f8ced', '#cb65ff', '#fe5c4c', '#dd7a01', '#3ba755', '#0d9dda'];

    @api chartTitle;
    @api chartType;
    @api metricName;
    @api metricType;
    @api grouping1Name;
    // get grouping1Name() {
    //     return this._grouping1Name;
    // }
    // set grouping1Name(value) {
    //     console.log('in lwcc set grouping1Name = '+ value);
    //     this._grouping1Name = value;
    // }
    // _grouping1Name;
    @api grouping2Name;
    @api chartWidth;
    @api chartHeight;

    @api hideIfNoData;
    @api isStacked;

    @track datasets = [];
    @track uniqueGroupings = [];
    @track uniqueSubgroupings = [];

    @api 
    get chartDataString() {
        return this._chartDataString;
        // return JSON.stringify(this.rows);
    }
    set chartDataString(value) {
        this._chartDataString = value;
        let newRows = JSON.parse(value);
        this.uniqueGroupings = new Set();
        this.uniqueSubgroupings = new Set();
        for (let row of newRows) {
            this.uniqueGroupings.add(row.grouping);
            if (row.subgrouping) {
                console.log('adding subgrouping '+ row.subgrouping);
                this.uniqueSubgroupings.add(row.subgrouping);
            }
        }        
        console.log('there are '+ this.uniqueGroupings.size +' subgroupings: '+ JSON.stringify(this.uniqueSubgroupings))
        this.chartLabels = [...this.uniqueGroupings];
        this.datasets = [];
        if (this.uniqueSubgroupings.size === 0) {
            this.datasets = [{
                data: newRows.map(row => row.value),
                colour: this.colours[0]
            }];
        } else {
            let i = 0;
            for (let subgrouping of this.uniqueSubgroupings) {
                let values = [];
                for (let grouping of this.uniqueGroupings) {
                    let matchingRow = newRows.find(row => row.subgrouping === subgrouping && row.grouping === grouping);
                    values.push(matchingRow ? matchingRow.value : 0);
                }
                console.log('subgrouping = '+ JSON.stringify(subgrouping), JSON.stringify(newRows.filter(row => row.subgrouping === subgrouping)));
                // let subgroupingMatches = newRows.filter(row => row.subgrouping === subgrouping);
                this.datasets.push({
                    label: subgrouping,
                    data: values,
                    // data: newRows.filter(row => row.subgrouping === subgrouping).map(row => row.value),
                    colour: this.colours[i % this.colours.length],
                    stack: 1
                });
                i++;
            }
        }
        this.rows = [];
        for (let row of newRows) {
            this.rows.push({
                label: row.grouping,
                value: row.value
            })
        }
    }
    _chartDataString;

    get datasetsString() {
        return JSON.stringify(this.datasets);
    }


    @api
    get rows() {
        return this._rows;
    }
    set rows(value) {
        // console.log('in set rows: '+ JSON.stringify(value));
        this._rows = value;
    }
    _rows = [];

    @track chartLabels = [];

    // get chartLabels() {
    //     let labels = this.rows.map(rec => rec.label);
    //     // console.log('in get chartLabels: '+ JSON.stringify(labels));
    //     return JSON.stringify(labels);
    // }

    get chartData() {
        let data = this.rows.map(rec => rec.value);
        // console.log('in get chartData: '+ JSON.stringify(data));
        return JSON.stringify(data);
    }

    get grouping1Axis() {
        return this.chartType === CHART_TYPES.HBAR ? 'y' : 'x';
    }

    get metricNameAxis() {
        return this.chartType === CHART_TYPES.HBAR ? 'x' : 'y';
    }    

    get hideChart() {
        // console.log('in hideChart');
        if (!this.hideIfNoData) {
            // console.log('hideIfNoData is false');
            return false;
        }
        if (this.rows.length && this.rows[0].value && this.rows[0].label) {
            // console.log('data found');
            return false;
        }
        // console.log('hiding because no data');
        return true;
    }

    connectedCallback() {
        // this.isStacked = true;
    }
}