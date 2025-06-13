export class DykePoleCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "character"],
      template: "systems/dyke-pole/templates/actor/character-sheet.html",
      width: 650,
      height: 780,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  getData() {
    const context = super.getData();
    
    // Організація предметів за типами
    context.aspects = this.actor.items.filter(i => i.type === "aspect");
    context.equipment = this.actor.items.filter(i => i.type === "equipment");
    context.shards = this.actor.items.filter(i => i.type === "shard");
    context.maps = this.actor.items.filter(i => i.type === "map");
    context.injuries = this.actor.items.filter(i => i.type === "injury");
    context.bonuses = this.actor.items.filter(i => i.type === "bonus");
    
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    
    // Обробка кидків навичок
    html.find('.rollable').click(this._onSkillRoll.bind(this));
    
    // Обробка предметів
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
    });

    // Обробка додавання нових предметів
    html.find('.item-create').click(this._onItemCreate.bind(this));
  }

  async _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const skillKey = element.dataset.skill;
    const skillName = game.i18n.localize(`DYKEPOLE.Skill${skillKey.charAt(0).toUpperCase() + skillKey.slice(1)}`);
    
    new Dialog({
      title: `Кидок: ${skillName}`,
      content: `
        <form>
          <div class="form-group">
            <label>Переваги:</label>
            <input type="number" name="advantage" value="0" min="0" max="3"/>
          </div>
          <div class="form-group">
            <label>Зріз:</label>
            <input type="number" name="cut" value="0" min="0" max="3"/>
          </div>
          <div class="form-group">
            <label>Вплив:</label>
            <select name="impact">
              <option value="low">Низький</option>
              <option value="normal" selected>Середній</option>
              <option value="high">Високий</option>
              <option value="massive">Масивний</option>
            </select>
          </div>
        </form>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d6"></i>',
          label: "Кинути",
          callback: (html) => {
            const form = html[0].querySelector("form");
            const options = {
              advantage: parseInt(form.advantage.value),
              cut: parseInt(form.cut.value),
              impact: form.impact.value
            };
            this.actor.rollAction(skillKey, options);
          }
        }
      },
      default: "roll",
      classes: ["dykepole", "dialog"]
    }).render(true);
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    
    const itemData = {
      name: `Новий ${game.i18n.localize(`DYKEPOLE.${type.charAt(0).toUpperCase() + type.slice(1)}`)}`,
      type: type
    };
    
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
}