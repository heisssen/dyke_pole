export class DykePoleCampSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "camp"],
      template: "systems/dyke-pole/templates/actor/camp-sheet.html",
      width: 700,
      height: 650
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.find('.rollable-rating').click(this._onRatingRoll.bind(this));

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
  }

  async _onRatingRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ratingKey = element.dataset.rating;
    new Dialog({
      title: `Кидок рейтингу: ${element.textContent}`,
      content: `<p>Введіть кількість переваг (до 2к6):</p><input type="number" value="0" min="0" max="2" id="advantage-input"/>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d6"></i>',
          label: "Кинути",
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