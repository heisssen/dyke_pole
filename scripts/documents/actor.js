export class DykePoleActor extends Actor {
  
  prepareData() {
    super.prepareData();
    
    if (this.type === 'character') {
      this._prepareCharacterData();
    }
    
    if (this.type === 'camp') {
      this._prepareCampData();
    }
  }

  _prepareCharacterData() {
    const systemData = this.system;
    
    // Обчислення максимальних значень для лічильників
    systemData.counters.steppe.track_max = 3;
    systemData.counters.ruin.track_max = 3;
    
    // Перевірка лімітів
    if (systemData.counters.steppe.track > systemData.counters.steppe.track_max) {
      systemData.counters.steppe.track = systemData.counters.steppe.track_max;
    }
    if (systemData.counters.ruin.track > systemData.counters.ruin.track_max) {
      systemData.counters.ruin.track = systemData.counters.ruin.track_max;
    }
  }

  _prepareCampData() {
    const systemData = this.system;
    
    // Перевірка лімітів рейтингів табору
    Object.keys(systemData.ratings).forEach(rating => {
      if (systemData.ratings[rating].value > systemData.ratings[rating].max) {
        systemData.ratings[rating].value = systemData.ratings[rating].max;
      }
      if (systemData.ratings[rating].value < 0) {
        systemData.ratings[rating].value = 0;
      }
    });
    
    // Перевірка лімітів вантажу
    if (systemData.cargo.value > systemData.cargo.max) {
      systemData.cargo.value = systemData.cargo.max;
    }
    if (systemData.cargo.value < 0) {
      systemData.cargo.value = 0;
    }
  }
  
  async rollAction(skillKey, { advantage = 0, cut = 0, impact = "normal" } = {}) {
    const skillValue = this.system.skills[skillKey] || 0;
    const dicePool = skillValue + advantage;

    const rollFormula = dicePool > 0 ? `${dicePool}d6` : "1d6";
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let originalResults = [];
    roll.dice[0].results.forEach(die => { originalResults.push(die.result); });

    let finalResults = [...originalResults].sort((a, b) => b - a);
    
    if (cut > 0 && finalResults.length > 0) {
      finalResults = finalResults.slice(cut);
    }
    
    let highestResult = finalResults.length > 0 ? finalResults[0] : 0;
    
    const hasTwist = new Set(originalResults).size !== originalResults.length;

    let resultText = "";
    let resultClass = "";
    let baseMarks = 0;

    if (dicePool === 0) {
      baseMarks = (highestResult >= 4) ? 1 : 0;
      resultText = (highestResult >= 4) ? game.i18n.localize("DYKEPOLE.Conflict") : game.i18n.localize("DYKEPOLE.Mishap");
      resultClass = (highestResult >= 4) ? "conflict" : "mishap";
    } else {
      if (highestResult === 6) {
          baseMarks = 2;
          resultText = game.i18n.localize("DYKEPOLE.Triumph");
          resultClass = "triumph";
      } else if (highestResult >= 4) {
          baseMarks = 1;
          resultText = game.i18n.localize("DYKEPOLE.Conflict");
          resultClass = "conflict";
      } else {
          baseMarks = 0;
          resultText = game.i18n.localize("DYKEPOLE.Mishap");
          resultClass = "mishap";
      }
    }
    
    let finalMarks = baseMarks;
    switch(impact) {
      case 'low': finalMarks = Math.max(0, baseMarks - 1); break;
      case 'high': finalMarks = baseMarks + 1; break;
      case 'massive': finalMarks = 99; break;
    }

    const chatData = {
      skillName: game.i18n.localize(`DYKEPOLE.Skill${skillKey.charAt(0).toUpperCase() + skillKey.slice(1)}`),
      resultText: resultText,
      resultClass: resultClass,
      hasTwist: hasTwist,
      rollFormula: roll.formula,
      rollResults: originalResults,
      finalMarks: finalMarks,
      impact: impact,
      cut: cut
    };
    
    const content = await renderTemplate("systems/dyke-pole/templates/chat/roll-card.html", chatData);
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: roll
    });
  }

  async rollCampRating(ratingKey, advantage = 0) {
    const ratingValue = this.system.ratings[ratingKey]?.value || 0;
    const dicePool = ratingValue + advantage;
    
    if (dicePool <= 0) {
      ui.notifications.warn("Рейтинг табору та переваги дорівнюють нулю. Кидок неможливий.");
      return;
    }

    const rollFormula = `${dicePool}d6`;
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let highestResult = 0;
    roll.dice[0].results.forEach(die => { 
      if (die.result > highestResult) { 
        highestResult = die.result; 
      } 
    });

    let resultText = "";
    let resultClass = "";
    if (highestResult === 6) { 
      resultText = game.i18n.localize("DYKEPOLE.Triumph");
      resultClass = "triumph";
    } else if (highestResult >= 4) { 
      resultText = game.i18n.localize("DYKEPOLE.Conflict");
      resultClass = "conflict";
    } else { 
      resultText = game.i18n.localize("DYKEPOLE.Mishap");
      resultClass = "mishap";
    }

    const chatData = {
      ratingName: game.i18n.localize(`DYKEPOLE.Rating${ratingKey.charAt(0).toUpperCase() + ratingKey.slice(1)}`),
      resultText: resultText,
      resultClass: resultClass,
      rollFormula: roll.formula,
      rollResults: roll.dice[0].results.map(r => r.result),
      advantage: advantage
    };
    
    const content = await renderTemplate("systems/dyke-pole/templates/chat/rating-roll-card.html", chatData);
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: roll
    });
  }
}