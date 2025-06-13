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

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.find('.rollable').click(this._onSkillRoll.bind(this));
    // Add listeners for item controls
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
    });
  }

  async _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const skillKey = element.dataset.skill;
    const dialogContent = `...`; // The dialog code from previous steps
    new Dialog({
      title: `Кидок: ${element.textContent}`,
      content: `
        <form>
          <div class="form-group"><label>Переваги:</label><input type="number" name="advantage" value="0" min="0" max="3"/></div>
          <div class="form-group"><label>Зріз:</label><input type="number" name="cut" value="0" min="0" max="3"/></div>
          <div class="form-group"><label>Вплив:</label><select name="impact"><option value="low">Низький</option><option value="normal" selected>Середній</option><option value="high">Високий</option><option value="massive">Масивний</option></select></div>
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
      default: "roll"
    }).render(true);
  }
}