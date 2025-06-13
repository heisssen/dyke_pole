import { DykePoleItemSheet } from "./item-sheet.js";

export class DykePoleAspectSheet extends DykePoleItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "item", "aspect"],
      template: `systems/dyke-pole/templates/item/aspect-sheet.html`,
      width: 560,
      height: 600
    });
  }

  getData() {
    const context = super.getData();
    
    // Додаткові дані для аспектів
    context.isAspect = true;
    
    return context;
  }
}