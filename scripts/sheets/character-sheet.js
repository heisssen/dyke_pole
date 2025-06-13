export class DykePoleCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dykepole", "sheet", "actor", "character"],
      template: "systems/dyke-pole/templates/actor/character-sheet.html",
      width: 800,
      height: 850,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Робимо навички клікабельними
    html.find('.rollable-skill').click(this._onSkillRoll.bind(this));
    
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

    // Обробник для клікабельних треків
    html.find('.track-box').click(this._onTrackClick.bind(this));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const name = `Новий ${type}`;
    const itemData = { name: name, type: type };
    await this.actor.createEmbeddedDocuments("Item", [itemData], {renderSheet: true});
  }

  _onTrackClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const currentVal = parseInt(element.parentElement.dataset.value);
    const newTrackerVal = parseInt(element.dataset.index) + 1;
    const dataPath = element.parentElement.dataset.path;

    if (newTrackerVal === currentVal) {
        this.actor.update({ [dataPath]: currentVal - 1 });
    } else {
        this.actor.update({ [dataPath]: newTrackerVal });
    }
  }

  async _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const skillKey = element.dataset.skill;
    const skillName = element.textContent.trim();
    
    new Dialog({
      title: game.i18n.format("DYKEPOLE.RollDialogTitle", {skill: skillName}),
      content: `
        <form>
          <div class="form-group"><label>${game.i18n.localize("DYKEPOLE.AdvantagePrompt")}</label><input type="number" name="advantage" value="0" min="0" max="3"/></div>
          <div class="form-group"><label>${game.i18n.localize("DYKEPOLE.CutPrompt")}</label><input type="number" name="cut" value="0" min="0" max="3"/></div>
          <div class="form-group"><label>${game.i18n.localize("DYKEPOLE.ImpactPrompt")}</label><select name="impact"><option value="low">Низький</option><option value="normal" selected>Середній</option><option value="high">Високий</option><option value="massive">Масивний</option></select></div>
        </form>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d6"></i>',
          label: game.i18n.localize("DYKEPOLE.Roll"),
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
}