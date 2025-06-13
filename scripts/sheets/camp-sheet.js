export class DykePoleCampSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "camp"],
      template: "systems/dyke-pole/templates/actor/camp-sheet.html",
      width: 750,
      height: 700
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.find('.rollable-rating').click(this._onRatingRoll.bind(this));

    // Обробники для кнопок предметів
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
    });
    html.find('.item-create').click(this._onItemCreate.bind(this));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const name = `Новий ${type === 'faction' ? 'гурт' : 'аспект'}`;
    const itemData = { name: name, type: type, system: {} };
    await this.actor.createEmbeddedDocuments("Item", [itemData], {renderSheet: true});
  }

  async _onRatingRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ratingKey = element.dataset.rating;
    const ratingName = element.textContent.trim();
    new Dialog({
      title: `Кидок рейтингу: ${ratingName}`,
      content: `<p>Введіть кількість переваг (до 2к6):</p><input type="number" value="0" min="0" max="2" id="advantage-input"/>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d6"></i>',
          label: game.i18n.localize("DYKEPOLE.Roll"),
          callback: (html) => {
            const advantage = parseInt(html.find('#advantage-input').val());
            this.actor.rollCampRating(ratingKey, advantage);
          }
        }
      },
      default: "roll",
      classes: ["dykepole", "dialog"]
    }).render(true);
  }
}