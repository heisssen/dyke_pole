export class DykePoleItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  
  get template() {
    return `systems/dyke-pole/templates/item/item-sheet.html`;
  }

  getData() {
    const context = super.getData();
    
    // Додаткові дані залежно від типу предмету
    context.isEquipment = this.item.type === "equipment";
    context.isShard = this.item.type === "shard";
    context.isMap = this.item.type === "map";
    context.isInjury = this.item.type === "injury";
    context.isBonus = this.item.type === "bonus";
    context.isFaction = this.item.type === "faction";
    
    return context;
  }
}