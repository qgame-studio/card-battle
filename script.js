class GameComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Define the game state
    this.player = {
      hp: 100,
      maxHp: 100,
      baseAttack: 5,
      gold: 0,
      exp: 0,
      expToLevel: 100,
      level: 1,
      selectedCards: []
    };
    this.deck = [];
    this.handCards = [];
    this.enemy = null;
    this.battleActive = false;
    this.currentTurn = 'player';
    this.battleLog = [];
    this.battleHistory = [];
    this.elements = ['fire', 'water', 'air', 'earth'];
    this.elementIcons = {
      fire: '🔥',
      water: '💧',
      air: '💨',
      earth: '🌍'
    };
    this.elementColors = {
      fire: '#ff7675',
      water: '#74b9ff',
      air: '#81ecec',
      earth: '#55efc4'
    };

    // Render the component
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        h1, h2, h3 {
          margin-bottom: 10px;
          color: #2c3e50;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        h1 {
          font-size: 28px;
        }
        h2 {
          font-size: 22px;
        }
        h3 {
          font-size: 18px;
        }
        .stats-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 10px;
          border-radius: 8px;
          font-weight: bold;
        }
        .progress-container {
          width: 100%;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin: 8px 0;
          overflow: hidden;
        }
        .progress-bar {
          height: 8px;
          transition: width 0.3s;
        }
        .hp-bar {
          background-color: #e74c3c;
        }
        .exp-bar {
          background-color: #3498db;
        }
        button {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background-color: #3498db;
          color: white;
          margin: 5px;
          transition: all 0.2s ease;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        button:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        #start-btn {
          background-color: #2ecc71;
        }
        #start-btn:hover {
          background-color: #27ae60;
        }
        #attack-btn {
          background-color: #e74c3c;
        }
        #attack-btn:hover {
          background-color: #c0392b;
        }
        .card {
          width: 120px;
          height: 180px;
          margin: 8px;
          display: inline-flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }
        .card.selected {
          border: 3px solid #2ecc71;
          transform: translateY(-8px);
        }
        .card-number {
          font-size: 24px;
          font-weight: bold;
        }
        .card-element {
          font-size: 30px;
          margin-bottom: 5px;
        }
        .card-image {
          width: 80px;
          height: 80px;
          background-color: #f1f1f1;
          border-radius: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cards-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: 15px 0;
        }
        .battle-area {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 20px 0;
          padding: 15px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 10px;
        }
        .player-area, .enemy-area {
          width: 45%;
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
        }
        .vs {
          font-size: 32px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e74c3c;
        }
        .battle-log {
          max-height: 150px;
          overflow-y: auto;
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          margin: 15px 0;
          text-align: left;
        }
        .log-entry {
          margin: 5px 0;
          padding: 3px 0;
          border-bottom: 1px solid #eee;
        }
        .player-log {
          color: #2980b9;
        }
        .enemy-log {
          color: #c0392b;
        }
        .combo-log {
          color: #8e44ad;
          font-weight: bold;
        }
        .tab-container {
          margin: 20px 0;
        }
        .tab-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        .tab-button {
          background-color: #ecf0f1;
          border: none;
          padding: 10px 20px;
          margin: 0 5px;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          font-weight: bold;
          color: #7f8c8d;
        }
        .tab-button.active {
          background-color: #3498db;
          color: white;
        }
        .tab-content {
          display: none;
          padding: 20px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
        }
        .tab-content.active {
          display: block;
        }
        .history-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          margin: 5px 0;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .win {
          border-left: 5px solid #2ecc71;
        }
        .lose {
          border-left: 5px solid #e74c3c;
        }
        .enemy-card {
          width: 150px;
          height: 200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          background-color: #c0392b;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 15px;
          color: white;
        }
        .enemy-image {
          width: 100px;
          height: 100px;
          background-color: #a33;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .enemy-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .level-badge {
          background-color: #f39c12;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
        }
        .game-over {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .result-win {
          color: #27ae60;
        }
        .result-lose {
          color: #c0392b;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 0.5s;
        }
        .fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      </style>
      <div class="container">
        <h1>Card Battle Arena</h1>
        
        <div id="main-menu" style="display: block;">
          <div class="stats-bar">
            <div>Level: <span id="player-level" class="level-badge">1</span></div>
            <div>HP: <span id="player-hp">100</span>/<span id="player-max-hp">100</span></div>
            <div>Attack: <span id="player-attack">5</span></div>
            <div>Gold: <span id="player-gold">0</span></div>
          </div>
          
          <div>
            Experience: <span id="player-exp">0</span>/<span id="player-exp-to-level">100</span>
            <div class="progress-container">
              <div id="exp-bar" class="progress-bar exp-bar" style="width: 0%"></div>
            </div>
          </div>
          
          <button id="start-battle-btn" class="start-btn">Start Battle</button>
          
          <div class="tab-container">
            <div class="tab-buttons">
              <button class="tab-button active" data-tab="stats">Stats</button>
              <button class="tab-button" data-tab="history">Battle History</button>
              <button class="tab-button" data-tab="instructions">How To Play</button>
            </div>
            
            <div id="stats-tab" class="tab-content active">
              <h2>Player Stats</h2>
              <p>Total Battles: <span id="total-battles">0</span></p>
              <p>Wins: <span id="total-wins">0</span></p>
              <p>Losses: <span id="total-losses">0</span></p>
              <p>Win Rate: <span id="win-rate">0</span>%</p>
            </div>
            
            <div id="history-tab" class="tab-content">
              <h2>Battle History</h2>
              <div id="history-container">
                <p>No battles yet.</p>
              </div>
            </div>

            <div id="instructions-tab" class="tab-content">
              <h2>Game Instructions</h2>
              <p>A turn-based card game where you use a deck of unlimited cards, each with a unique number (0-10) and elemental attribute (fire, water, air, earth). Choose your cards wisely, unleash powerful combos, and defeat enemies in strategic battles. With each victory, you earn gold and experience, allowing you to level up and grow stronger.</p>
              <div id="instructions-container">
                <h3>Starting the Game:</h3>
                <p>You begin each battle with 8 random cards in front of you. Your cards have two attributes: a number (0-10) and an element (fire, water, air, earth).</p>

                <h3>Card Play:</h3>
                <p>Each turn, you can select up to 4 cards to attack the enemy. The number on the card represents its attack value, and your base attack damage is added to this number.</p>

                <h3>Combos for Bonus Damage:</h3>
                <p>Creating combos can deal extra damage:</p>
                <p>4 cards in sequential number order (e.g., 3, 4, 5, 6).</p>
                <p>3 or 4 cards of the same element (e.g., all water cards).</p>
                <p>2, 3, or 4 cards of the same number.</p>

                <h3>Drawing Cards:</h3>
                <p>After using cards, you will always draw a new card to maintain a hand of 8 cards.</p>

                <h3>Enemy Attacks:</h3>
                <p>The enemy is represented as a single card with high health points and intermediate attack damage. After your turn, the enemy will strike back.</p>

                <h3>Winning and Losing:</h3>
                <p>Winning: Defeat the enemy to earn gold and experience. Your health is fully restored after each win.</p>
                <p>Losing: If you lose, the battle is recorded in your match history, but you won't lose any stats.</p>

                <h3>Leveling Up:</h3>
                <p>As you gain experience and level up, your health and base attack damage increase, making future battles easier to win.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div id="battle-screen" style="display: none;">
          <div class="battle-area">
            <div class="player-area">
              <h3>Player</h3>
              <div>HP: <span id="battle-player-hp">100</span>/<span id="battle-player-max-hp">100</span></div>
              <div class="progress-container">
                <div id="battle-hp-bar" class="progress-bar hp-bar" style="width: 100%"></div>
              </div>
            </div>
            
            <div class="vs">VS</div>
            
            <div class="enemy-area">
              <h3>Enemy</h3>
              <div>HP: <span id="enemy-hp">0</span>/<span id="enemy-max-hp">0</span></div>
              <div class="progress-container">
                <div id="enemy-hp-bar" class="progress-bar hp-bar" style="width: 100%"></div>
              </div>
              <div id="enemy-container" class="fade-in"></div>
            </div>
          </div>
          
          <div id="battle-turn-indicator">Player's Turn</div>
          
          <div class="battle-log">
            <div id="log-container"></div>
          </div>
          
          <h3>Your Hand</h3>
          <div id="hand-container" class="cards-container"></div>
          
          <div id="action-buttons">
            <button id="attack-btn" disabled>Attack (<span id="selected-count">0</span>/4)</button>
            <button id="end-turn-btn" disabled>End Turn</button>
          </div>
        </div>
        
        <div id="battle-result" class="game-over" style="display: none;">
          <h2 id="result-title">Battle Result</h2>
          <p id="result-message"></p>
          <div id="rewards-container" style="display: none;">
            <h3>Rewards</h3>
            <p>Gold: +<span id="gold-reward">0</span></p>
            <p>Experience: +<span id="exp-reward">0</span></p>
          </div>
          <button id="continue-btn">Continue</button>
        </div>
      </div>
    `;

    // Bind methods to the component
    this.startBattle = this.startBattle.bind(this);
    this.endBattle = this.endBattle.bind(this);
    this.generateDeck = this.generateDeck.bind(this);
    this.drawCards = this.drawCards.bind(this);
    this.renderHandCards = this.renderHandCards.bind(this);
    this.selectCard = this.selectCard.bind(this);
    this.attack = this.attack.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.enemyTurn = this.enemyTurn.bind(this);
    this.checkCombos = this.checkCombos.bind(this);
    this.updateBattleLog = this.updateBattleLog.bind(this);
    this.switchTab = this.switchTab.bind(this);
    this.updateStats = this.updateStats.bind(this);
    this.updateBattleHistory = this.updateBattleHistory.bind(this);
    this.levelUp = this.levelUp.bind(this);

    // Add event listeners
    this.shadowRoot.getElementById('start-battle-btn').addEventListener('click', this.startBattle);
    this.shadowRoot.getElementById('attack-btn').addEventListener('click', this.attack);
    this.shadowRoot.getElementById('end-turn-btn').addEventListener('click', this.endTurn);
    this.shadowRoot.getElementById('continue-btn').addEventListener('click', () => {
      this.shadowRoot.getElementById('battle-result').style.display = 'none';
      this.shadowRoot.getElementById('main-menu').style.display = 'block';
    });

    // Tab switching
    const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabId = e.target.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Initialize game
    this.init();
  }

  init() {
    // Initialize game state
    this.totalBattles = 0;
    this.totalWins = 0;
    this.totalLosses = 0;

    // Update UI
    this.updateStats();
  }

  startBattle() {
    // Initialize battle state
    this.battleActive = true;
    this.currentTurn = 'player';
    this.battleLog = [];
    this.player.selectedCards = [];
    this.player.hp = this.player.maxHp; // Heal player to full before battle

    // Generate enemy
    this.generateEnemy();

    // Generate deck and draw initial hand
    this.generateDeck();
    this.handCards = [];
    this.drawCards(8);

    // Update UI
    this.shadowRoot.getElementById('battle-player-hp').textContent = this.player.hp;
    this.shadowRoot.getElementById('battle-player-max-hp').textContent = this.player.maxHp;
    this.shadowRoot.getElementById('battle-hp-bar').style.width = '100%';
    this.shadowRoot.getElementById('enemy-hp').textContent = this.enemy.hp;
    this.shadowRoot.getElementById('enemy-max-hp').textContent = this.enemy.maxHp;
    this.shadowRoot.getElementById('enemy-hp-bar').style.width = '100%';
    this.shadowRoot.getElementById('battle-turn-indicator').textContent = "Player's Turn";
    this.shadowRoot.getElementById('log-container').innerHTML = '';
    this.shadowRoot.getElementById('selected-count').textContent = '0';
    this.shadowRoot.getElementById('attack-btn').disabled = true;
    this.shadowRoot.getElementById('end-turn-btn').disabled = false;

    // Render enemy
    this.renderEnemy();

    // Render hand cards
    this.renderHandCards();

    // Log battle start
    this.updateBattleLog('Battle started!', 'system');

    // Show battle screen
    this.shadowRoot.getElementById('main-menu').style.display = 'none';
    this.shadowRoot.getElementById('battle-screen').style.display = 'block';
    this.shadowRoot.getElementById('battle-result').style.display = 'none';
  }

  generateDeck() {
    this.deck = [];

    // Create a deck with unlimited cards (we'll just generate them as needed)
    // In reality, we'll just generate new cards when drawing
  }

  drawCards(count) {
    for (let i = 0; i < count; i++) {
      const newCard = this.generateRandomCard();
      this.handCards.push(newCard);
    }
  }

  generateRandomCard() {
    const number = Math.floor(Math.random() * 11); // 0-10
    const element = this.elements[Math.floor(Math.random() * this.elements.length)];
    return {
      number,
      element,
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9) // unique ID
    };
  }

  renderHandCards() {
    const handContainer = this.shadowRoot.getElementById('hand-container');
    handContainer.innerHTML = '';

    this.handCards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.setAttribute('data-id', card.id);
      cardElement.style.borderColor = this.elementColors[card.element];

      // Check if card is selected
      if (this.player.selectedCards.some(c => c.id === card.id)) {
        cardElement.classList.add('selected');
      }

      cardElement.innerHTML = `
        <div class="card-number">${card.number}</div>
        <div class="card-image">
          <img src="/images/champions/${card.number}.jpg" alt="Card ${card.number}">
        </div>
        <div class="card-element" title="${card.element}">${this.elementIcons[card.element]}</div>
      `;

      cardElement.addEventListener('click', () => this.selectCard(card));
      handContainer.appendChild(cardElement);
    });
  }

  selectCard(card) {
    if (!this.battleActive || this.currentTurn !== 'player') return;

    const isSelected = this.player.selectedCards.some(c => c.id === card.id);

    if (isSelected) {
      // Deselect card
      this.player.selectedCards = this.player.selectedCards.filter(c => c.id !== card.id);
    } else {
      // Select card if less than 4 cards are selected
      if (this.player.selectedCards.length < 4) {
        this.player.selectedCards.push(card);
      } else {
        return; // Can't select more than 4 cards
      }
    }

    // Update UI
    this.shadowRoot.getElementById('selected-count').textContent = this.player.selectedCards.length;
    this.shadowRoot.getElementById('attack-btn').disabled = this.player.selectedCards.length === 0;
    this.renderHandCards();
  }

  attack() {
    if (!this.battleActive || this.currentTurn !== 'player' || this.player.selectedCards.length === 0) return;

    // Calculate damage
    let totalDamage = 0;
    let comboDescription = [];

    // Base damage from cards
    this.player.selectedCards.forEach(card => {
      totalDamage += card.number + this.player.baseAttack;
    });

    // Check for combos
    const combos = this.checkCombos(this.player.selectedCards);
    combos.forEach(combo => {
      totalDamage += combo.bonus;
      comboDescription.push(combo.description);
    });

    // Apply damage to enemy
    this.enemy.hp = Math.max(0, this.enemy.hp - totalDamage);

    // Update battle log
    this.updateBattleLog(`Player attacks for ${totalDamage} damage!`, 'player');

    // Log combos if any
    if (comboDescription.length > 0) {
      comboDescription.forEach(desc => {
        this.updateBattleLog(`COMBO: ${desc}`, 'combo');
      });
    }

    // Update UI
    this.shadowRoot.getElementById('enemy-hp').textContent = this.enemy.hp;
    const enemyHpPercent = (this.enemy.hp / this.enemy.maxHp) * 100;
    this.shadowRoot.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;

    // Add shake animation to enemy
    const enemyContainer = this.shadowRoot.getElementById('enemy-container');
    enemyContainer.classList.add('shake');
    setTimeout(() => {
      enemyContainer.classList.remove('shake');
    }, 500);

    // Remove used cards from hand and draw new ones
    this.player.selectedCards.forEach(selectedCard => {
      const index = this.handCards.findIndex(card => card.id === selectedCard.id);
      if (index !== -1) {
        this.handCards.splice(index, 1);
      }
    });

    // Draw new cards to replace used ones
    this.drawCards(this.player.selectedCards.length);

    // Reset selected cards
    this.player.selectedCards = [];
    this.shadowRoot.getElementById('selected-count').textContent = '0';
    this.shadowRoot.getElementById('attack-btn').disabled = true;

    // Render updated hand
    this.renderHandCards();

    // Check if enemy is defeated
    if (this.enemy.hp <= 0) {
      this.battleVictory();
      return;
    }

    // End player turn
    this.endTurn();
  }

  checkCombos(cards) {
    const combos = [];

    // Check for cards of the same number
    const numberGroups = {};
    cards.forEach(card => {
      if (!numberGroups[card.number]) {
        numberGroups[card.number] = [];
      }
      numberGroups[card.number].push(card);
    });

    Object.keys(numberGroups).forEach(number => {
      const group = numberGroups[number];
      if (group.length === 2) {
        combos.push({
          bonus: 5,
          description: `Pair of ${number}s (5 bonus damage)`
        });
      } else if (group.length === 3) {
        combos.push({
          bonus: 15,
          description: `Three of a kind: ${number}s (15 bonus damage)`
        });
      } else if (group.length === 4) {
        combos.push({
          bonus: 30,
          description: `Four of a kind: ${number}s (30 bonus damage)`
        });
      }
    });

    // Check for cards of the same element
    const elementGroups = {};
    cards.forEach(card => {
      if (!elementGroups[card.element]) {
        elementGroups[card.element] = [];
      }
      elementGroups[card.element].push(card);
    });

    Object.keys(elementGroups).forEach(element => {
      const group = elementGroups[element];
      if (group.length === 4) {
        combos.push({
          bonus: 25,
          description: `Elemental Harmony: All ${element} (25 bonus damage)`
        });
      } else if (group.length === 3) {
        combos.push({
          bonus: 10,
          description: `Elemental Trio: Three ${element} (10 bonus damage)`
        });
      }
    });

    // Check for sequence (cards in a row)
    if (cards.length === 4) {
      const numbers = cards.map(card => card.number).sort((a, b) => a - b);
      let isSequence = true;

      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] !== numbers[i - 1] + 1) {
          isSequence = false;
          break;
        }
      }

      if (isSequence) {
        combos.push({
          bonus: 20,
          description: `Sequence: ${numbers[0]}-${numbers[3]} (20 bonus damage)`
        });
      }
    }

    return combos;
  }

  endTurn() {
    if (!this.battleActive) return;

    if (this.currentTurn === 'player') {
      this.currentTurn = 'enemy';
      this.shadowRoot.getElementById('battle-turn-indicator').textContent = "Enemy's Turn";
      this.shadowRoot.getElementById('attack-btn').disabled = true;
      this.shadowRoot.getElementById('end-turn-btn').disabled = true;

      // Enemy attacks after a short delay
      setTimeout(() => this.enemyTurn(), 1000);
    } else {
      this.currentTurn = 'player';
      this.shadowRoot.getElementById('battle-turn-indicator').textContent = "Player's Turn";
      this.shadowRoot.getElementById('attack-btn').disabled = this.player.selectedCards.length === 0;
      this.shadowRoot.getElementById('end-turn-btn').disabled = false;
    }
  }

  enemyTurn() {
    if (!this.battleActive) return;

    // Enemy attacks
    const damage = this.enemy.attackDamage;
    this.player.hp = Math.max(0, this.player.hp - damage);

    // Update battle log
    this.updateBattleLog(`Enemy attacks for ${damage} damage!`, 'enemy');

    // Update UI
    this.shadowRoot.getElementById('battle-player-hp').textContent = this.player.hp;
    const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
    this.shadowRoot.getElementById('battle-hp-bar').style.width = `${playerHpPercent}%`;

    // Add shake animation to player area
    const playerArea = this.shadowRoot.querySelector('.player-area');
    playerArea.classList.add('shake');
    setTimeout(() => {
      playerArea.classList.remove('shake');
    }, 500);

    // Check if player is defeated
    if (this.player.hp <= 0) {
      this.battleDefeat();
      return;
    }

    // End enemy turn
    setTimeout(() => this.endTurn(), 1000);
  }

  generateEnemy() {
    // Scale enemy stats based on player level
    const level = this.player.level;
    const hp = 70 + (level * 30);
    const attackDamage = 5 + (level * 2);

    this.enemy = {
      name: this.generateEnemyName(),
      level: level,
      hp: hp,
      maxHp: hp,
      attackDamage: attackDamage
    };
  }

  generateEnemyName() {
    const prefixes = ['Dark', 'Mighty', 'Corrupted', 'Ancient', 'Furious'];
    const types = ['Golem', 'Dragon', 'Elemental', 'Titan', 'Guardian'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    return `${prefix} ${type}`;
  }

  renderEnemy() {
    const enemyContainer = this.shadowRoot.getElementById('enemy-container');
    enemyContainer.innerHTML = `
      <div class="enemy-card fade-in">
        <div class="enemy-image">
          <img src="/images/monsters/${this.enemy.name.toLowerCase().replace(" ", "_")}.jpg" alt="Enemy">
        </div>
        <h3>${this.enemy.name}</h3>
        <div class="level-badge">Level ${this.enemy.level}</div>
        <div>Attack: ${this.enemy.attackDamage}</div>
      </div>
    `;
  }

  updateBattleLog(message, source) {
    const logContainer = this.shadowRoot.getElementById('log-container');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${source}-log`;
    logEntry.textContent = message;

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll to bottom

    // Add to battle log array
    this.battleLog.push({ message, source });
  }

  battleVictory() {
    this.battleActive = false;

    // Calculate rewards based on enemy level
    const goldReward = 10 * this.enemy.level;
    const expReward = 20 * this.enemy.level;

    // Update player stats
    this.player.gold += goldReward;
    this.player.exp += expReward;

    // Check for level up
    if (this.player.exp >= this.player.expToLevel) {
      this.levelUp();
    }

    // Update battle history
    this.battleHistory.push({
      enemy: this.enemy.name,
      enemyLevel: this.enemy.level,
      result: 'win',
      playerHpRemaining: this.player.hp,
      enemyHpRemaining: 0,
      goldReward,
      expReward,
      timestamp: new Date().toISOString()
    });

    // Update totals
    this.totalBattles++;
    this.totalWins++;

    // Update UI
    this.shadowRoot.getElementById('player-hp').textContent = this.player.hp;
    this.shadowRoot.getElementById('player-gold').textContent = this.player.gold;
    this.shadowRoot.getElementById('player-exp').textContent = this.player.exp;
    this.shadowRoot.getElementById('player-level').textContent = this.player.level;
    this.shadowRoot.getElementById('exp-bar').style.width = `${(this.player.exp / this.player.expToLevel) * 100}%`;

    // Show victory screen
    this.shadowRoot.getElementById('result-title').textContent = 'Victory!';
    this.shadowRoot.getElementById('result-message').textContent = `You defeated the ${this.enemy.name}!`;
    this.shadowRoot.getElementById('result-message').className = 'result-win';

    // Show rewards
    this.shadowRoot.getElementById('rewards-container').style.display = 'block';
    this.shadowRoot.getElementById('gold-reward').textContent = goldReward;
    this.shadowRoot.getElementById('exp-reward').textContent = expReward;

    // Show battle result screen
    this.shadowRoot.getElementById('battle-screen').style.display = 'none';
    this.shadowRoot.getElementById('battle-result').style.display = 'block';

    // Update stats and battle history
    this.updateStats();
    this.updateBattleHistory();
  }

  battleDefeat() {
    this.battleActive = false;

    // Update battle history
    this.battleHistory.push({
      enemy: this.enemy.name,
      enemyLevel: this.enemy.level,
      result: 'lose',
      playerHpRemaining: 0,
      enemyHpRemaining: this.enemy.hp,
      timestamp: new Date().toISOString()
    });

    // Update totals
    this.totalBattles++;
    this.totalLosses++;

    // Show defeat screen
    this.shadowRoot.getElementById('result-title').textContent = 'Defeat!';
    this.shadowRoot.getElementById('result-message').textContent = `You were defeated by the ${this.enemy.name}!`;
    this.shadowRoot.getElementById('result-message').className = 'result-lose';

    // Hide rewards
    this.shadowRoot.getElementById('rewards-container').style.display = 'none';

    // Show battle result screen
    this.shadowRoot.getElementById('battle-screen').style.display = 'none';
    this.shadowRoot.getElementById('battle-result').style.display = 'block';

    // Update stats and battle history
    this.updateStats();
    this.updateBattleHistory();
  }

  levelUp() {
    // Increase level
    this.player.level++;

    // Reset exp and increase exp to next level
    const expOverflow = this.player.exp - this.player.expToLevel;
    this.player.expToLevel = Math.floor(this.player.expToLevel * 1.5);
    this.player.exp = expOverflow;

    // Increase stats
    this.player.maxHp += 20;
    this.player.hp = this.player.maxHp; // Heal to full on level up
    this.player.baseAttack += 2;

    // Update UI
    this.shadowRoot.getElementById('player-level').textContent = this.player.level;
    this.shadowRoot.getElementById('player-max-hp').textContent = this.player.maxHp;
    this.shadowRoot.getElementById('player-hp').textContent = this.player.hp;
    this.shadowRoot.getElementById('player-attack').textContent = this.player.baseAttack;
    this.shadowRoot.getElementById('player-exp-to-level').textContent = this.player.expToLevel;

    // Add level up message if in battle
    if (this.battleActive) {
      this.updateBattleLog('Level Up! You are now level ' + this.player.level, 'system');
    }
  }

  updateStats() {
    // Update stats UI
    this.shadowRoot.getElementById('player-level').textContent = this.player.level;
    this.shadowRoot.getElementById('player-hp').textContent = this.player.hp;
    this.shadowRoot.getElementById('player-max-hp').textContent = this.player.maxHp;
    this.shadowRoot.getElementById('player-attack').textContent = this.player.baseAttack;
    this.shadowRoot.getElementById('player-gold').textContent = this.player.gold;
    this.shadowRoot.getElementById('player-exp').textContent = this.player.exp;
    this.shadowRoot.getElementById('player-exp-to-level').textContent = this.player.expToLevel;
    this.shadowRoot.getElementById('exp-bar').style.width = `${(this.player.exp / this.player.expToLevel) * 100}%`;

    // Update battle stats
    this.shadowRoot.getElementById('total-battles').textContent = this.totalBattles;
    this.shadowRoot.getElementById('total-wins').textContent = this.totalWins;
    this.shadowRoot.getElementById('total-losses').textContent = this.totalLosses;

    // Calculate win rate
    const winRate = this.totalBattles > 0 ? Math.round((this.totalWins / this.totalBattles) * 100) : 0;
    this.shadowRoot.getElementById('win-rate').textContent = winRate;
  }

  updateBattleHistory() {
    const historyContainer = this.shadowRoot.getElementById('history-container');

    if (this.battleHistory.length === 0) {
      historyContainer.innerHTML = '<p>No battles yet.</p>';
      return;
    }

    historyContainer.innerHTML = '';

    // Sort history by timestamp (newest first)
    const sortedHistory = [...this.battleHistory].reverse();

    sortedHistory.forEach(battle => {
      const historyItem = document.createElement('div');
      historyItem.className = `history-item ${battle.result}`;

      const date = new Date(battle.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

      historyItem.innerHTML = `
        <div>
          <strong>${battle.result === 'win' ? 'Victory' : 'Defeat'}</strong> vs ${battle.enemy} (Lvl ${battle.enemyLevel})
          <div><small>${formattedDate}</small></div>
        </div>
        <div>
          ${battle.result === 'win' ?
          `Gold: +${battle.goldReward} | XP: +${battle.expReward}` :
          'No rewards'}
        </div>
      `;

      historyContainer.appendChild(historyItem);
    });
  }

  switchTab(tabId) {
    // Hide all tabs
    const tabContents = this.shadowRoot.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
      tab.classList.remove('active');
    });

    // Deactivate all tab buttons
    const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });

    // Show selected tab
    this.shadowRoot.getElementById(`${tabId}-tab`).classList.add('active');

    // Activate selected tab button
    this.shadowRoot.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
  }

  endBattle() {
    this.battleActive = false;
    this.shadowRoot.getElementById('battle-screen').style.display = 'none';
    this.shadowRoot.getElementById('main-menu').style.display = 'block';
  }
}

// Define the custom element
customElements.define('game-component', GameComponent);
