export class DykePoleCampSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "camp"],
      template: "systems/dyke-pole/templates/actor/camp-sheet.html",
      width: 700,
      height: 650
    });
  }

  getData() {
    const context = super.getData();
    
    // Організація предметів за типами
    context.factions = this.actor.items.filter(i => i.type === "faction");
    context.aspects = this.actor.items.filter(i => i.type === "aspect");
    
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    
    // Обробка кидків рейтингів
    html.find('.rollable-rating').click(this._onRatingRoll.bind(this));
    
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

  async _onRatingRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ratingKey = element.dataset.rating;
    const ratingName = game.i18n.localize(`DYKEPOLE.Rating${ratingKey.charAt(0).toUpperCase() + ratingKey.slice(1)}`);
    
    new Dialog({
      title: `Кидок рейтингу: ${ratingName}`,
      content: `
        <form>
          <div class="form-group">
            <label>Переваги (до 2к6):</label>
            <input type="number" name="advantage" value="0" min="0" max="2"/>
          </div>
        </form>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d6"></i>',
          label: "Кинути",
          callback: (html) => {
            const form = html[0].querySelector("form");
            const advantage = parseInt(form.advantage.value);
            this.actor.rollCampRating(ratingKey, advantage);
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
      name: `Нова ${game.i18n.localize(`DYKEPOLE.${type.charAt(0).toUpperCase() + type.slice(1)}`)}`,
      type: type
    };
    
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
}