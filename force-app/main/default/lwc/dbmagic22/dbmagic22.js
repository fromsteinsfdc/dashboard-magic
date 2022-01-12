import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import { getConfirmation, handleConfirmationButtonClick } from 'c/fsc_lwcModalUtil';

const CONFIRMATIONS = {
    DELETE_GROUPING: {
        text: 'This will delete all items in this grouping. Are you sure?',
        confirmButtonLabel: 'Delete',
        confirmButtonVariant: 'destructive',
        header: 'Confirm Delete'
    },
    CLEAR_ALL: {
        text: 'Are you sure you want to delete all data?',
        confirmButtonLabel: 'Delete',
        confirmButtonVariant: 'destructive',
        header: 'Confirm Delete'
    },
    MASS_ADD_SUBGROUPINGS: {
        text: 'This will overwrite and erase any existing subgroupings. Do you want to continue?',
        header: 'Confirm Add Subgroupings'
    }
}

const MESSAGES = {
    INVALID: 'Please complete all fields in order to continue.',
    PREVIEW_HELPTEXT: 'The chart below is not a Lightning report chart, it is simply meant to give you an idea of how your fake data is shaping up. The report and chart this tool generates will be a standard Lightning report, with the same UI and configuration availabilities as any other Lightning report chart.'
}

export default class Dbmagic22 extends LightningElement {
    /* PUBLIC PROPERTIES */
    @api grouping1Name;
    @api grouping2Name;
    @api metricName;
    @api metricType;
    @api reportFolderDevName;
    @api useSubgroupings;
    @api fakedataRecords = [];

    @api
    get fakedataString() {
        return JSON.stringify(this.fakedata);
    }
    set fakedataString(value) {
        console.log('setting fakedata to ' + value);
        this.fakedata = JSON.parse(value);
    }
    @track fakedata = [];

    /* PUBLIC FUNCTIONS */
    @api
    validate() {
        let allValid = true;
        for (let input of this.template.querySelectorAll('lightning-input')) {
            allValid = input.reportValidity() && allValid;
        }
        if (allValid) {
            return { isValid: true };
        }
        else {
            return {
                isValid: false,
                errorMessage: MESSAGES.INVALID
            };
        }
    }

    /* PRIVATE PROPERTIES */
    @track confirmation;
    indexCount = 0;
    massAddString;

    /* PRIVATE GETTERS AND SETTERS */
    get massAddModalEl() {
        return this.template.querySelector('.massAddModal');
    }

    get massAddInputEl() {
        return this.template.querySelector('.massAddModal textarea');
    }

    get massAddSubgroupings() {
        return this.massAddString ? this.massAddString.split('\n') : [];
    }


    get currentGroupingIndices() {
        let indices = new Set();
        for (let datum of this.fakedata) {
            indices.add(Number(datum.groupingIndex));
        }
        return [...indices];
    }

    get currentGroupings() {
        let groupings = [];
        for (let index of this.currentGroupingIndices) {
            let datum = this.fakedata.find(datum => datum.groupingIndex == index);
            if (datum) {
                groupings.push({
                    name: datum.grouping,
                    groupingIndex: datum.groupingIndex,
                    get label() {
                        return this.name || '[grouping #' + (Number(datum.groupingIndex) + 1) + ']'
                    }
                })
            }
        }
        return groupings;
    }

    get currentGroupingIndicesString() {
        return JSON.stringify(this.currentGroupingIndices);
    }

    get currentGroupingsString() {
        return JSON.stringify(this.currentGroupings);
    }

    get clearAllIsDisabled() {
        return this.fakedata.length === 1 && !this.fakedata[0].grouping && !this.fakedata[0].subgrouping && !this.fakedata[0].value;
    }

    /* LIFECYCLE HOOKS */
    connectedCallback() {
        this.resetData();
    }

    /* ACTION FUNCTIONS */
    resetData() {
        this.indexCount = 0;
        this.fakedata = [this.newRow()];
        this.massAddString = '';
        this.updateData();
    }

    newRow(groupingIndex, grouping, subgrouping) {
        console.log('in newRow, groupingIndex = ' + groupingIndex + ', grouping = ' + grouping + ', subgrouping = ' + subgrouping);
        let isFirst = !(groupingIndex || groupingIndex === 0);
        // console.log('isFirst = ' + isFirst + ', because groupingIndex || groupingIndex === 0 = ' + !(groupingIndex || groupingIndex === 0));
        if (isFirst) {
            groupingIndex = this.indexCount;
            this.indexCount++;
        } else {
            let existingGroupingMember = this.fakedata.find(datum => {
                return datum.groupingIndex == groupingIndex;
            });
            grouping = existingGroupingMember.grouping;
        }

        let row = {
            grouping: grouping || null,
            subgrouping: subgrouping || null,
            value: 0,
            groupingIndex: groupingIndex,
            isFirst: isFirst,
            id: Date.now()
        }
        console.log('finishing newRow');
        return row;
    }

    addRow(groupingIndex, grouping, subgrouping) {
        console.log('in addrow, groupingIndex = ' + groupingIndex, 'subgrouping = ' + subgrouping);
        let newRow = this.newRow(groupingIndex, grouping, subgrouping);
        // let tempData = [...this.fakedata];
        if (groupingIndex >= 0) {
            let lastIndex = this.fakedata.map(row => {
                return row.groupingIndex == groupingIndex;
            }).lastIndexOf(true);
            this.fakedata.splice(lastIndex + 1, 0, newRow);
        } else {
            this.fakedata.push(newRow)
        }
        return newRow;
    }

    addGrouping(grouping) {
        if (!this.massAddSubgroupings.length) {
            this.addRow();
        } else {
            // if (this.massAddSubgroupings.length && newRow) {
            let currentGroupingIndex;
            for (let subgrouping of this.massAddSubgroupings) {
                // console.log('looping through subgrouping ' + subgrouping, 'fakedata = ' + JSON.stringify(this.fakedata));
                this.addRow(currentGroupingIndex, grouping, subgrouping);
                if (!currentGroupingIndex)
                    currentGroupingIndex = this.fakedata[this.fakedata.length - 1].groupingIndex;
            }

        }
    }

    deleteGrouping(groupingIndex) {
        this.fakedata = this.fakedata.filter(datum => datum.groupingIndex != groupingIndex);
        if (this.currentGroupingIndices.length === 0) {
            this.resetData();
        }
        this.updateData();
    }

    updateData() {
        console.log('in updateData');
        for (let i = 0; i < this.fakedata.length; i++) {
            // this.fakedata[i].index = i;
        }
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'fakedataString',
            this.fakedataString
        );
        this.dispatchEvent(new FlowAttributeChangeEvent('fakedataString', this.fakedataString));

    }

    /* EVENT HANDLERS */
    handleFakedataChange(event) {
        // console.log('in handleFakedataChange');
        let property = event.target.dataset.property;
        let index = event.target.dataset.index;
        let groupingIndex = event.target.dataset.groupingIndex;
        let value = event.target.value;
        if (property === 'grouping' && this.useSubgroupings) {
            for (let datum of this.fakedata) {
                if (datum.groupingIndex == groupingIndex) {
                    datum.grouping = value;
                }
            }
        } else {
            this.fakedata[index][property] = value;
        }
        this.updateData();
    }

    handleAddGroupingClick() {
        this.addGrouping();
        this.updateData();
    }

    handleAddSubgroupingClick(event) {
        let groupingIndex = event.target.dataset.groupingIndex;
        this.addRow(groupingIndex);
        this.updateData();
    }

    handleClearAllClick() {
        this.confirmation = getConfirmation(
            CONFIRMATIONS.CLEAR_ALL,
            () => this.resetData()
        );
    }

    handleGroupingDelete(event) {
        let groupingIndex = event.target.dataset.groupingIndex;
        if (this.useSubgroupings) {
            // Require confirmation if using subgroupings (and will therefore be deleting an entire grouping rather than just a single row)
            this.confirmation = getConfirmation(
                CONFIRMATIONS.DELETE_GROUPING,
                () => 
                    this.deleteGrouping(groupingIndex)
                    // this.fakedata = this.fakedata.filter(datum => datum.groupingIndex != groupingIndex);
                    // if (this.currentGroupingIndices.length === 0) {
                    //     this.resetData();
                    // }
                
            );
        } else {
            this.deleteGrouping(groupingIndex)
        }
        // this.updateData();
    }

    handleSubgroupingDelete(event) {
        console.log('in handleSubgroupingDelete');
        let index = Number(event.target.dataset.index);
        console.log('index = ' + index);
        let datum = this.fakedata[index];
        console.log('datum = ' + JSON.stringify(datum));

        if (datum.isFirst) {
            if (index == this.fakedata.length - 1 || this.fakedata[index + 1].groupingIndex != datum.groupingIndex) {
                datum.subgrouping = null;
                datum.value = 0;
                return;
            }
            this.fakedata[index + 1].isFirst = true;
        }
        this.fakedata.splice(index, 1);
        this.updateData();
    }

    handleOpenMassAddClick() {
        this.massAddModalEl.open();
    }

    handleMassAddConfirm() {
        let newMassAddString = this.massAddInputEl.value;
        this.confirmation = getConfirmation(
            CONFIRMATIONS.MASS_ADD_SUBGROUPINGS,
            () => {
                this.massAddString = newMassAddString;
                let currentGroupings = this.currentGroupings;
                this.fakedata = [];
                for (let grouping of currentGroupings) {
                    this.addGrouping(grouping.name);
                }
                this.updateData();
            }
        );
    }

    handleModalButtonClick(event) {
        handleConfirmationButtonClick(event, this.confirmation);
    }

    /* UTILITY FUNCTIONS */
    transformConstantObject(constant) {
        return {
            list: constant,
            get options() { return Object.values(this.list); },
            get default() { return this.options.find(option => option.default); },
            findFromValue: function (value) {
                let entry = this.options.find(option => option.value == value);
                return entry || this.default;
            },
            findFromLabel: function (label) {
                let entry = this.options.find(option => option.label == label);
                return entry || this.default;
            }
        }
    }
}