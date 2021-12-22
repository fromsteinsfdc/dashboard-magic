import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

const ICONS = {
    RIGHT: 'utility:right',
    DOWN: 'utility:down'
};

export default class FlowAccordion extends LightningElement {
    @api isExpanded;
    @api label;
    @api groupName;

    get iconName() {
        return this.isExpanded ? ICONS.DOWN : ICONS.RIGHT;
    }

    toggleAccordion() {
        this.isExpanded = !this.isExpanded;
        const attributeChangeEvent = new FlowAttributeChangeEvent('isExpanded', this.isExpanded);
        this.dispatchEvent(attributeChangeEvent);
    }

    handleClick() {
        this.toggleAccordion();
    }
}