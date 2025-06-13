export class DykePoleItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "item"],
      width: 520,
      height: 320,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  
  get template() {
    return `systems/dyke-pole/templates/item/item-sheet.html`;
  }
}