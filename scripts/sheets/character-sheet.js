export class DykePoleCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "character"],
      template: "systems/dyke-pole/templates/actor/character-sheet.html",
      width: 1150,
      height: 850,
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = this.actor.system;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Клік на навичку для кидка
    html.find('.rollable-skill').click(this._onSkillRoll.bind(this));
    
    // Керування предметами
    html.find('.item-name').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));

    // Клік на треки
    html.find('.track-box').click(this._onTrackClick.bind(this));
  }

  _onItemEdit(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item-controls").parent();
    this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
  }
  
  _onTrackClick(event) {
    event.preventDefault();
    const element = $(event.currentTarget);
    const trackElement = element.parent();
    const currentVal = trackElement.data('value');
    const newTrackerVal = parseInt(element.data('index')) + 1;
    const dataPath = trackElement.data('path');

    this.actor.update({ [dataPath]: (newTrackerVal === currentVal) ? currentVal - 1 : newTrackerVal });
  }

  async _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const skillKey = element.dataset.skill;
    const skillName = $(element).find('label').text().trim();
    
    new Dialog({
      title: game.i18n.format("DYKEPOLE.RollDialogTitle", {skill: skillName}),
      content: `...`, // Код діалогу залишається таким самим
      buttons: { /* ... */ },
      default: "roll",
      classes: ["dykepole", "dialog"]
    }).render(true);
  }
}