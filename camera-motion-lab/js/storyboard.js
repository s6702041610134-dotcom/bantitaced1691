/**
 * Storyboard system for generating and rendering auto-generated storyboard cards.
 */

export class StoryboardSystem {
  constructor() {
    /** @type {Array<Object>} */
    this.cards = [];
  }

  /**
   * Generates a storyboard card based on a completed mission attempt.
   * @param {Object} data - Information about the shot and mission.
   * @param {string} data.frameDataURL - Base64 thumbnail image.
   * @param {string} data.shotNumber - Identifier like 'SHOT 01'.
   * @param {string} data.shotSize - Size category e.g., 'Wide Shot'.
   * @param {string} data.cameraAngle - Angle category e.g., 'Low Angle'.
   * @param {string} data.movementType - Type of movement e.g., 'Dolly'.
   * @param {string} data.movementDirection - Direction e.g., 'In'.
   * @param {string} data.description - Scene description.
   * @param {string} data.missionTitle - The name of the mission.
   * @param {number} data.stars - Star rating received (1-3).
   * @returns {Object} The generated card object.
   */
  generateCard({
    frameDataURL,
    shotNumber,
    shotSize,
    cameraAngle,
    movementType,
    movementDirection,
    description,
    missionTitle,
    stars
  }) {
    const card = {
      id: Date.now().toString(),
      frameDataURL,
      shotNumber,
      shotSize,
      cameraAngle,
      movementType,
      movementDirection,
      description,
      missionTitle,
      stars
    };
    this.cards.push(card);
    return card;
  }

  /**
   * Retrieves all generated cards.
   * @returns {Array<Object>} Array of card objects.
   */
  getCards() {
    return this.cards;
  }

  /**
   * Clears all generated cards.
   */
  clearCards() {
    this.cards = [];
  }

  /**
   * Generates HTML markup for a single storyboard card.
   * @param {Object} card - The card object.
   * @returns {string} HTML string.
   */
  renderCardHTML(card) {
    const starHTML = Array(3).fill(0).map((_, i) => 
      `<span class="star ${i < card.stars ? 'filled' : 'empty'}">★</span>`
    ).join('');

    const arrowIcon = this._getArrowIcon(card.movementType, card.movementDirection);

    return `
      <div class="storyboard-card" data-id="${card.id}">
        <div class="storyboard-card__thumbnail" style="background-image: url('${card.frameDataURL}');">
        </div>
        <div class="storyboard-card__content">
          <div class="storyboard-card__header">
            <span class="storyboard-card__shot-number">${card.shotNumber}</span>
            <span class="storyboard-card__stars">${starHTML}</span>
          </div>
          <div class="storyboard-card__info">
            <p><strong>Mission:</strong> ${card.missionTitle}</p>
            <p><strong>Size:</strong> ${card.shotSize}</p>
            <p><strong>Angle:</strong> ${card.cameraAngle}</p>
            <p class="storyboard-card__movement">
              <strong>Movement:</strong> ${card.movementType} ${card.movementDirection} ${arrowIcon}
            </p>
          </div>
          <div class="storyboard-card__description">
            "${card.description}"
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generates HTML markup for the entire storyboard strip.
   * @returns {string} HTML string.
   */
  renderStripHTML() {
    if (this.cards.length === 0) {
      return `<div class="storyboard-strip empty">No shots recorded yet. Complete missions to build your storyboard.</div>`;
    }

    const cardsHTML = this.cards.map(card => this.renderCardHTML(card)).join('');
    
    return `
      <div class="storyboard-strip">
        ${cardsHTML}
      </div>
    `;
  }

  /**
   * Helper to return a simple arrow icon based on movement direction.
   * @param {string} type 
   * @param {string} direction 
   * @returns {string} HTML span with arrow symbol.
   */
  _getArrowIcon(type, direction) {
    let arrow = '';
    const d = (direction || '').toLowerCase();
    
    if (d === 'left') arrow = '←';
    else if (d === 'right') arrow = '→';
    else if (d === 'up') arrow = '↑';
    else if (d === 'down') arrow = '↓';
    else if (d === 'in') arrow = '↗'; // representing moving forward/in
    else if (d === 'out') arrow = '↙';
    
    if (!arrow) return '';
    return `<span class="movement-arrow">${arrow}</span>`;
  }
}
