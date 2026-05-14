// ---------- BLACKJACK GAME ENGINE ----------
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let waitingForDealer = false;
let currentBet = 0;
let bank = 1000;
let betPlaced = false;
let doubleDownUsed = false;
let handResolved = false;
let dealerHoleCardHidden = true;
let gameInProgress = false;
let roundInProgress = false;
let handsPlayed = 0;
const MAX_HANDS = 50;

// Insurance & Even Money variables
let insuranceTaken = false;
let insuranceAmount = 0;
let evenMoneyTaken = false;
let awaitingInsuranceDecision = false;
let awaitingEvenMoneyDecision = false;

// Split variables
let splitActive = false;
let splitHand1 = [];
let splitHand2 = [];
let splitHand1Done = false;
let splitHand2Done = false;
let splitHand1DoubleUsed = false;
let splitHand2DoubleUsed = false;
let splitHand1Bet = 0;
let splitHand2Bet = 0;
let splitAces = false;
let currentSplitHandActive = 1;

// DOM elements
const bankSpan = document.getElementById('bankValue');
const currentBetSpan = document.getElementById('currentBetSpan');
const dealerCardsDiv = document.getElementById('dealerCardsContainer');
const playerCardsDiv = document.getElementById('playerCardsContainer');
const dealerScoreSpan = document.getElementById('dealerScoreDisplay');
const playerScoreSpan = document.getElementById('playerScoreDisplay');
const chatMessagesDiv = document.getElementById('chatMessages');
const progressBarFill = document.getElementById('progressBarFill');
const progressPercent = document.getElementById('progressPercent');
const handsPlayedProgress = document.getElementById('handsPlayedProgress');
const totalHandsProgress = document.getElementById('totalHandsProgress');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const doubleBtn = document.getElementById('doubleBtn');
const splitBtn = document.getElementById('splitBtn');
const newGameBtn = document.getElementById('newGameBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const betPlusBtn = document.getElementById('betPlusBtn');
const betMinusBtn = document.getElementById('betMinusBtn');
const placeBetBtn = document.getElementById('placeBetBtn');
const clearChatBtn = document.getElementById('clearChatBtn');

// Split DOM elements
const splitHandsContainer = document.getElementById('splitHandsContainer');
const splitHand1Cards = document.getElementById('splitHand1Cards');
const splitHand2Cards = document.getElementById('splitHand2Cards');
const splitHand1Score = document.getElementById('splitHand1Score');
const splitHand2Score = document.getElementById('splitHand2Score');

// Insurance panel elements
const insurancePanel = document.getElementById('insurancePanel');
const insuranceMessage = document.getElementById('insuranceMessage');
const insuranceYesBtn = document.getElementById('insuranceYesBtn');
const insuranceNoBtn = document.getElementById('insuranceNoBtn');

// Helper Functions
function isSoftSeventeen(hand) {
    const handValue = calcHandValue(hand);
    if (handValue !== 17) return false;
    let sumWithAcesAs11 = 0;
    let aceCount = 0;
    for (let card of hand) {
        if (card.rank === 'A') {
            sumWithAcesAs11 += 11;
            aceCount++;
        } else {
            sumWithAcesAs11 += card.value;
        }
    }
    return sumWithAcesAs11 <= 21 && aceCount > 0;
}

function calcHandValue(hand) {
    let sum = 0;
    let aces = 0;
    for (let card of hand) {
        sum += card.value;
        if (card.rank === 'A') aces++;
    }
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

function isBlackjack(hand) {
    return hand.length === 2 && calcHandValue(hand) === 21;
}

function dealerShowingAce() {
    return dealerHand.length > 0 && dealerHand[1] && dealerHand[1].rank === 'A';
}

function isPair(hand) {
    if (hand.length !== 2) return false;
    const card1 = hand[0];
    const card2 = hand[1];
    if (card1.rank === 'A' && card2.rank === 'A') return true;
    if (card1.rank === card2.rank) return true;
    const tenValues = ['10', 'J', 'Q', 'K'];
    if (tenValues.includes(card1.rank) && tenValues.includes(card2.rank)) return true;
    return false;
}

// Progress Bar Functions
function createProgressStars(percentage) {
    if (!progressBarFill) return;
    const existingStars = progressBarFill.querySelectorAll('.progress-star');
    existingStars.forEach(star => star.remove());
    const starCount = Math.min(40, Math.floor(percentage / 2.5));
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'progress-star';
        const starTypes = ['⭐', '🌟', '✨', '⭐', '🌟', '💫'];
        star.textContent = starTypes[Math.floor(Math.random() * starTypes.length)];
        const randomX = 3 + Math.random() * 94;
        star.style.left = `${randomX}%`;
        star.style.top = `${-18 + Math.random() * 28}px`;
        star.style.fontSize = `${9 + Math.random() * 12}px`;
        star.style.opacity = `${0.5 + Math.random() * 0.5}`;
        star.style.position = 'absolute';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '5';
        star.style.animation = `starTwinkle ${0.8 + Math.random() * 1.5}s ease-in-out infinite`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        progressBarFill.appendChild(star);
    }
}

function createFloatingParticles(percentage) {
    const progressContainer = document.querySelector('.progress-container');
    if (!progressContainer) return;
    const thresholds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const crossedThreshold = thresholds.find(t => Math.abs(percentage - t) < 2 && percentage >= t);
    if (crossedThreshold && !window[`threshold_${crossedThreshold}_triggered`]) {
        window[`threshold_${crossedThreshold}_triggered`] = true;
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'threshold-particle';
            particle.textContent = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.bottom = `0px`;
            particle.style.position = 'absolute';
            particle.style.fontSize = `${12 + Math.random() * 10}px`;
            particle.style.animation = `particleFloat ${1 + Math.random() * 0.5}s ease-out forwards`;
            progressContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
        addChatMessage(`✨ ${Math.floor(crossedThreshold)}% of hands completed! ✨`, 'system');
        setTimeout(() => delete window[`threshold_${crossedThreshold}_triggered`], 1000);
    }
}

function updateHandsProgressBar() {
    const percentage = (handsPlayed / MAX_HANDS) * 100;
    const roundedPercentage = Math.floor(percentage);
    progressBarFill.style.width = `${percentage}%`;
    progressPercent.innerText = `${roundedPercentage}%`;
    handsPlayedProgress.innerText = handsPlayed;
    totalHandsProgress.innerText = MAX_HANDS;
    createProgressStars(percentage);
    createFloatingParticles(percentage);
    const milestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    if (milestones.includes(handsPlayed) && handsPlayed > 0) {
        celebrateMilestone(handsPlayed);
    }
}

function celebrateMilestone(milestone) {
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.classList.add('pulse-glow');
    setTimeout(() => progressContainer.classList.remove('pulse-glow'), 1500);
    progressBarFill.classList.add('progress-flash');
    setTimeout(() => progressBarFill.classList.remove('progress-flash'), 1500);
    let message = '';
    if (milestone <= 10) message = `Great start! ${milestone}/50 hands completed!`;
    else if (milestone <= 20) message = `Keep going! ${milestone}/50 hands completed!`;
    else if (milestone <= 30) message = `You're on fire! ${milestone}/50 hands completed!`;
    else if (milestone <= 40) message = `Almost there! ${milestone}/50 hands completed!`;
    else if (milestone <= 49) message = `So close! ${milestone}/50 hands completed!`;
    else message = `🎉 LEGENDARY! You completed all 50 hands! 🎉`;
    addChatMessage(`⭐ MILESTONE: ${message}`, 'system');
    createVisualEffects(milestone);
}

function createVisualEffects(milestone) {
    const progressContainer = document.querySelector('.progress-container');
    const count = 15 + Math.floor(milestone / 5);
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'milestone-icon';
        star.textContent = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 80}px`;
        star.style.fontSize = `${12 + Math.random() * 15}px`;
        progressContainer.appendChild(star);
        setTimeout(() => star.remove(), 2000);
    }
}

function addChatMessage(message, type = 'system') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    messageDiv.innerHTML = `<span class="chat-timestamp">[${timestamp}]</span> ${message}`;
    chatMessagesDiv.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    while (chatMessagesDiv.children.length > 200) chatMessagesDiv.removeChild(chatMessagesDiv.firstChild);
}

function clearChatLog() {
    chatMessagesDiv.innerHTML = '';
    addChatMessage('Chat history cleared!', 'system');
    addChatMessage('🎰 Welcome to Blackjack Royale!', 'welcome');
}

function updateBankrollUI() { bankSpan.innerText = Math.floor(bank); }
function updateBetUI() { currentBetSpan.innerText = currentBet; }

function createDeck() {
    const suits = ['♠', '♥', '♣', '♦'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let newDeck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            let value = (rank === 'A') ? 11 : (['K', 'Q', 'J'].includes(rank)) ? 10 : parseInt(rank);
            newDeck.push({ rank, suit, value });
        }
    }
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    const isRed = (card.suit === '♥' || card.suit === '♦');
    const rankSpan = document.createElement('div'); rankSpan.className = 'card-rank'; rankSpan.innerText = card.rank;
    const suitSpan = document.createElement('div'); suitSpan.className = 'card-suit'; suitSpan.innerText = card.suit;
    if (isRed) { rankSpan.classList.add('suit-red'); suitSpan.classList.add('suit-red'); }
    else { rankSpan.classList.add('suit-black'); suitSpan.classList.add('suit-black'); }
    div.appendChild(rankSpan); div.appendChild(suitSpan);
    return div;
}

function renderPlayerHand() {
    playerCardsDiv.innerHTML = '';
    for (let card of playerHand) playerCardsDiv.appendChild(createCardElement(card));
    playerScoreSpan.innerText = calcHandValue(playerHand);
}

function renderDealerHand() {
    dealerCardsDiv.innerHTML = '';
    for (let i = 0; i < dealerHand.length; i++) {
        if (i === 0 && dealerHoleCardHidden && gameActive && !handResolved && !splitActive) {
            const hiddenDiv = document.createElement('div'); hiddenDiv.className = 'card hidden-card';
            hiddenDiv.style.width = '100px'; hiddenDiv.style.height = '130px';
            dealerCardsDiv.appendChild(hiddenDiv);
        } else {
            dealerCardsDiv.appendChild(createCardElement(dealerHand[i]));
        }
    }
    if (!dealerHoleCardHidden || !gameActive || handResolved || splitActive) {
        dealerScoreSpan.innerText = calcHandValue(dealerHand);
    } else if (dealerHand.length > 1) {
        dealerScoreSpan.innerText = `${dealerHand[1].value} + ?`;
    } else { dealerScoreSpan.innerText = '?'; }
}

function renderSplitHands() {
    if (splitHand1Cards) {
        splitHand1Cards.innerHTML = '';
        for (let card of splitHand1) {
            splitHand1Cards.appendChild(createCardElement(card));
        }
        splitHand1Score.innerText = calcHandValue(splitHand1);
    }
    if (splitHand2Cards) {
        splitHand2Cards.innerHTML = '';
        for (let card of splitHand2) {
            splitHand2Cards.appendChild(createCardElement(card));
        }
        splitHand2Score.innerText = calcHandValue(splitHand2);
    }
}

function revealDealerHoleCard() { dealerHoleCardHidden = false; renderDealerHand(); }
function drawCardFromDeck() { if (deck.length === 0) deck = createDeck(); return deck.pop(); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Split Functions
function performSplit() {
    if (!gameActive || splitActive || handResolved || playerHand.length !== 2 || !isPair(playerHand) || bank < currentBet) {
        if (!isPair(playerHand) && playerHand.length === 2) {
            addChatMessage(`Cannot split: ${playerHand[0].rank} and ${playerHand[1].rank} are not a pair!`, 'system');
        } else if (bank < currentBet) {
            addChatMessage(`Cannot split: Insufficient funds! Need ${currentBet} points.`, 'system');
        }
        return;
    }

    addChatMessage(`✂️ SPLITTING ${playerHand[0].rank}s!`, 'split');

    bank -= currentBet;
    updateBankrollUI();

    splitHand1Bet = currentBet;
    splitHand2Bet = currentBet;

    splitHand1 = [playerHand[0]];
    splitHand2 = [playerHand[1]];

    splitAces = (playerHand[0].rank === 'A' && playerHand[1].rank === 'A');

    splitHand1.push(drawCardFromDeck());
    splitHand2.push(drawCardFromDeck());

    splitActive = true;
    splitHand1Done = false;
    splitHand2Done = false;
    splitHand1DoubleUsed = false;
    splitHand2DoubleUsed = false;

    addChatMessage(`💰 Split bet: ${splitHand1Bet} points on each hand`, 'split');
    addChatMessage(`🃟 SPLIT HAND 1: ${splitHand1[0].rank} + ${splitHand1[1].rank} = ${calcHandValue(splitHand1)}`, 'split');
    addChatMessage(`🃟 SPLIT HAND 2: ${splitHand2[0].rank} + ${splitHand2[1].rank} = ${calcHandValue(splitHand2)}`, 'split');

    if (splitAces) {
        addChatMessage(`♠️ SPLIT ACES: Each Ace gets ONE additional card only. No hitting/doubling allowed.`, 'split');
        splitHand1Done = true;
        splitHand2Done = true;
    }

    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '0.4';
    }

    splitHandsContainer.style.display = 'block';
    renderSplitHands();

    setButtonsState(false);
    gameActive = false;

    if (splitAces) {
        addChatMessage(`🏁 Split Aces complete. Dealer's turn...`, 'system');
        finishSplitRound();
    } else {
        activateSplitHand(1);
    }
}

function activateSplitHand(handNumber) {
    currentSplitHandActive = handNumber;

    addChatMessage(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'system');
    addChatMessage(`🎮 PLAYING SPLIT HAND ${handNumber}`, 'split');

    const activeHand = handNumber === 1 ? splitHand1 : splitHand2;
    const handValue = calcHandValue(activeHand);
    const doubleUsed = handNumber === 1 ? splitHand1DoubleUsed : splitHand2DoubleUsed;

    addChatMessage(`📊 Hand value: ${handValue}`, 'split');

    const allHitBtns = document.querySelectorAll('.split-hit-btn');
    const allStandBtns = document.querySelectorAll('.split-stand-btn');
    const allDoubleBtns = document.querySelectorAll('.split-double-btn');

    allHitBtns.forEach(btn => btn.disabled = true);
    allStandBtns.forEach(btn => btn.disabled = true);
    allDoubleBtns.forEach(btn => btn.disabled = true);

    const activeHitBtn = document.querySelector(`.split-hit-btn[data-hand="${handNumber}"]`);
    const activeStandBtn = document.querySelector(`.split-stand-btn[data-hand="${handNumber}"]`);
    const activeDoubleBtn = document.querySelector(`.split-double-btn[data-hand="${handNumber}"]`);

    if (activeHitBtn) activeHitBtn.disabled = false;
    if (activeStandBtn) activeStandBtn.disabled = false;

    if (activeDoubleBtn && activeHand.length === 2 && !doubleUsed && !splitAces && bank >= (handNumber === 1 ? splitHand1Bet : splitHand2Bet)) {
        activeDoubleBtn.disabled = false;
    } else if (activeDoubleBtn) {
        activeDoubleBtn.disabled = true;
    }

    if (handValue === 21) {
        addChatMessage(`🎉 SPLIT HAND ${handNumber} has 21! Auto-standing.`, 'split');
        splitHandStand(handNumber);
    }
}

async function splitHandHit(handNumber) {
    if ((handNumber === 1 && splitHand1Done) || (handNumber === 2 && splitHand2Done)) {
        return;
    }

    if (splitAces) {
        addChatMessage(`❌ Split Aces cannot be hit!`, 'system');
        return;
    }

    const hand = handNumber === 1 ? splitHand1 : splitHand2;
    const doubleUsed = handNumber === 1 ? splitHand1DoubleUsed : splitHand2DoubleUsed;

    if (doubleUsed) {
        addChatMessage(`❌ You already doubled down on this hand!`, 'system');
        return;
    }

    const newCard = drawCardFromDeck();
    hand.push(newCard);
    renderSplitHands();

    const handValue = calcHandValue(hand);
    addChatMessage(`🃟 SPLIT HAND ${handNumber} HIT → Drew ${newCard.rank}${newCard.suit}`, 'split');
    addChatMessage(`📊 New value: ${handValue}`, 'split');

    if (handValue > 21) {
        addChatMessage(`💥 SPLIT HAND ${handNumber} BUSTS!`, 'loss');
        if (handNumber === 1) splitHand1Done = true;
        else splitHand2Done = true;

        if (handNumber === 1 && !splitHand2Done) {
            activateSplitHand(2);
        } else if (handNumber === 2 && !splitHand1Done) {
            activateSplitHand(1);
        } else {
            finishSplitRound();
        }
    } else if (handValue === 21) {
        addChatMessage(`🎯 SPLIT HAND ${handNumber} reached 21! Auto-standing.`, 'split');
        if (handNumber === 1) splitHand1Done = true;
        else splitHand2Done = true;

        if (handNumber === 1 && !splitHand2Done) {
            activateSplitHand(2);
        } else if (handNumber === 2 && !splitHand1Done) {
            activateSplitHand(1);
        } else {
            finishSplitRound();
        }
    }
}

async function splitHandStand(handNumber) {
    if ((handNumber === 1 && splitHand1Done) || (handNumber === 2 && splitHand2Done)) {
        return;
    }

    const hand = handNumber === 1 ? splitHand1 : splitHand2;
    const handValue = calcHandValue(hand);

    addChatMessage(`✋ SPLIT HAND ${handNumber} STANDS at ${handValue}`, 'split');

    if (handNumber === 1) splitHand1Done = true;
    else splitHand2Done = true;

    if (handNumber === 1 && !splitHand2Done) {
        activateSplitHand(2);
    } else if (handNumber === 2 && !splitHand1Done) {
        activateSplitHand(1);
    } else {
        finishSplitRound();
    }
}

async function splitHandDouble(handNumber) {
    const hand = handNumber === 1 ? splitHand1 : splitHand2;
    const doubleUsed = handNumber === 1 ? splitHand1DoubleUsed : splitHand2DoubleUsed;
    const currentBetAmount = handNumber === 1 ? splitHand1Bet : splitHand2Bet;

    if (doubleUsed) {
        addChatMessage(`❌ Already doubled on split hand ${handNumber}!`, 'system');
        return;
    }

    if (hand.length !== 2) {
        addChatMessage(`❌ Can only double on first two cards of split hand ${handNumber}!`, 'system');
        return;
    }

    if (splitAces) {
        addChatMessage(`❌ Cannot double on split Aces!`, 'system');
        return;
    }

    if (bank < currentBetAmount) {
        addChatMessage(`❌ Insufficient funds to double! Need ${currentBetAmount} points.`, 'system');
        return;
    }

    bank -= currentBetAmount;
    updateBankrollUI();

    if (handNumber === 1) {
        splitHand1DoubleUsed = true;
        splitHand1Bet = currentBetAmount * 2;
    } else {
        splitHand2DoubleUsed = true;
        splitHand2Bet = currentBetAmount * 2;
    }

    addChatMessage(`⚡ SPLIT HAND ${handNumber} DOUBLE DOWN! Bet increased to ${currentBetAmount * 2} points`, 'split');

    const newCard = drawCardFromDeck();
    hand.push(newCard);
    renderSplitHands();

    const handValue = calcHandValue(hand);
    addChatMessage(`🃟 Drew ${newCard.rank}${newCard.suit} → Value: ${handValue}`, 'split');

    if (handNumber === 1) splitHand1Done = true;
    else splitHand2Done = true;

    if (handNumber === 1 && !splitHand2Done) {
        activateSplitHand(2);
    } else if (handNumber === 2 && !splitHand1Done) {
        activateSplitHand(1);
    } else {
        finishSplitRound();
    }
}

async function finishSplitRound() {
    addChatMessage(`🏁 Both split hands complete. Dealer's turn...`, 'system');

    const allSplitBtns = document.querySelectorAll('.split-hit-btn, .split-stand-btn, .split-double-btn');
    allSplitBtns.forEach(btn => btn.disabled = true);

    waitingForDealer = true;
    revealDealerHoleCard();
    await sleep(600);

    let dealerVal = calcHandValue(dealerHand);
    let dealerIsSoft17 = isSoftSeventeen(dealerHand);

    while (dealerVal < 17 || (dealerVal === 17 && !dealerIsSoft17)) {
        addChatMessage(`Dealer hits (${dealerVal})`, 'dealer');
        dealerHand.push(drawCardFromDeck());
        dealerVal = calcHandValue(dealerHand);
        dealerIsSoft17 = isSoftSeventeen(dealerHand);
        renderDealerHand();
        await sleep(600);
    }
    addChatMessage(`Dealer stands at ${dealerVal}`, 'dealer');
    await sleep(500);

    determineSplitWinner();
}

function determineSplitWinner() {
    const dealerVal = calcHandValue(dealerHand);
    const dealerHasBlackjack = isBlackjack(dealerHand);
    let totalNetChange = 0;

    // Split Hand 1
    const hand1Val = calcHandValue(splitHand1);
    const hand1IsBlackjack = isBlackjack(splitHand1);
    let hand1Payout = 0;

    if (hand1Val > 21) {
        hand1Payout = 0;
        addChatMessage(`✂️ SPLIT HAND 1 (${hand1Val}) - BUST! You lose ${splitHand1Bet} points`, 'loss');
    } else if (dealerVal > 21) {
        hand1Payout = splitHand1Bet * 2;
        addChatMessage(`✅ SPLIT HAND 1 (${hand1Val}) - WIN! Dealer busts. You win ${splitHand1Bet} points`, 'win');
    } else if (hand1IsBlackjack && !dealerHasBlackjack) {
        hand1Payout = splitHand1Bet + Math.floor(splitHand1Bet * 1.5);
        addChatMessage(`🃟 SPLIT HAND 1 - BLACKJACK! You win ${Math.floor(splitHand1Bet * 1.5)} points (3:2)`, 'blackjack');
    } else if (dealerHasBlackjack && !hand1IsBlackjack) {
        hand1Payout = 0;
        addChatMessage(`💔 SPLIT HAND 1 - Dealer has Blackjack! You lose ${splitHand1Bet} points`, 'loss');
    } else if (hand1Val > dealerVal) {
        hand1Payout = splitHand1Bet * 2;
        addChatMessage(`🏆 SPLIT HAND 1 (${hand1Val} vs ${dealerVal}) - WIN! You win ${splitHand1Bet} points`, 'win');
    } else if (dealerVal > hand1Val) {
        hand1Payout = 0;
        addChatMessage(`💔 SPLIT HAND 1 (${hand1Val} vs ${dealerVal}) - LOSS! You lose ${splitHand1Bet} points`, 'loss');
    } else {
        hand1Payout = splitHand1Bet;
        addChatMessage(`🤝 SPLIT HAND 1 (${hand1Val} vs ${dealerVal}) - PUSH! Bet returned: ${splitHand1Bet} points`, 'push');
    }

    // Split Hand 2
    const hand2Val = calcHandValue(splitHand2);
    const hand2IsBlackjack = isBlackjack(splitHand2);
    let hand2Payout = 0;

    if (hand2Val > 21) {
        hand2Payout = 0;
        addChatMessage(`✂️ SPLIT HAND 2 (${hand2Val}) - BUST! You lose ${splitHand2Bet} points`, 'loss');
    } else if (dealerVal > 21) {
        hand2Payout = splitHand2Bet * 2;
        addChatMessage(`✅ SPLIT HAND 2 (${hand2Val}) - WIN! Dealer busts. You win ${splitHand2Bet} points`, 'win');
    } else if (hand2IsBlackjack && !dealerHasBlackjack) {
        hand2Payout = splitHand2Bet + Math.floor(splitHand2Bet * 1.5);
        addChatMessage(`🃟 SPLIT HAND 2 - BLACKJACK! You win ${Math.floor(splitHand2Bet * 1.5)} points (3:2)`, 'blackjack');
    } else if (dealerHasBlackjack && !hand2IsBlackjack) {
        hand2Payout = 0;
        addChatMessage(`💔 SPLIT HAND 2 - Dealer has Blackjack! You lose ${splitHand2Bet} points`, 'loss');
    } else if (hand2Val > dealerVal) {
        hand2Payout = splitHand2Bet * 2;
        addChatMessage(`🏆 SPLIT HAND 2 (${hand2Val} vs ${dealerVal}) - WIN! You win ${splitHand2Bet} points`, 'win');
    } else if (dealerVal > hand2Val) {
        hand2Payout = 0;
        addChatMessage(`💔 SPLIT HAND 2 (${hand2Val} vs ${dealerVal}) - LOSS! You lose ${splitHand2Bet} points`, 'loss');
    } else {
        hand2Payout = splitHand2Bet;
        addChatMessage(`🤝 SPLIT HAND 2 (${hand2Val} vs ${dealerVal}) - PUSH! Bet returned: ${splitHand2Bet} points`, 'push');
    }

    totalNetChange = hand1Payout + hand2Payout;
    bank += totalNetChange;
    updateBankrollUI();

    // Only increment hands if not already counted
    if (!handResolved) {
        handsPlayed++;
        updateHandsProgressBar();
        addChatMessage(`📊 Hand ${handsPlayed}/${MAX_HANDS} completed (Split hand)`, 'system');
    }

    // Reset split state BUT KEEP UI VISIBLE
    splitActive = false;
    splitHand1Done = true;
    splitHand2Done = true;

    // Disable split buttons
    const allSplitBtns = document.querySelectorAll('.split-hit-btn, .split-stand-btn, .split-double-btn');
    allSplitBtns.forEach(btn => btn.disabled = true);

    // KEEP split container visible - DO NOT hide
    // Keep main hand opacity dimmed
    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '0.4';
    }

    // Reset game state for next round but keep cards shown
    gameActive = false;
    gameInProgress = false;
    roundInProgress = false;
    handResolved = true;
    betPlaced = false;
    doubleDownUsed = false;
    waitingForDealer = false;
    dealerHoleCardHidden = false; // Keep cards revealed

    // Reset insurance flags
    insuranceTaken = false;
    insuranceAmount = 0;
    evenMoneyTaken = false;
    awaitingInsuranceDecision = false;
    awaitingEvenMoneyDecision = false;

    // Enable betting controls
    enableBetControls(true);
    placeBetBtn.disabled = false;
    newGameBtn.disabled = true;
    splitBtn.disabled = true;

    // Hide any open panels
    hideInsurancePanel();

    if (bank <= 0) {
        addChatMessage(`💀 GAME OVER! You're out of points! Click RESET GAME.`, 'loss');
        enableBetControls(false);
        placeBetBtn.disabled = true;
        newGameBtn.disabled = true;
    } else if (handsPlayed < MAX_HANDS && bank > 0) {
        addChatMessage(`💰 Ready for next hand! Place your bet.`, 'system');
        addChatMessage(`📌 Split hands remain visible until you click NEW HAND.`, 'system');
    } else if (handsPlayed >= MAX_HANDS) {
        addChatMessage(`🏆 Congratulations! You've completed all ${MAX_HANDS} hands! Press RESET GAME to play again.`, 'system');
        enableBetControls(false);
        placeBetBtn.disabled = true;
        newGameBtn.disabled = true;
    }
}

function resetGameForNextRound() {
    // Reset all game state flags BUT KEEP CARDS VISIBLE
    gameActive = false;
    gameInProgress = false;
    roundInProgress = false;
    handResolved = true;
    betPlaced = false;
    doubleDownUsed = false;
    waitingForDealer = false;
    dealerHoleCardHidden = false; // Keep cards revealed

    // Reset insurance/split flags
    insuranceTaken = false;
    insuranceAmount = 0;
    evenMoneyTaken = false;
    awaitingInsuranceDecision = false;
    awaitingEvenMoneyDecision = false;

    // Enable betting controls
    enableBetControls(true);
    placeBetBtn.disabled = false;
    newGameBtn.disabled = true;
    splitBtn.disabled = true;

    // Hide any open panels
    hideInsurancePanel();
}

function resetSplitState() {
    // IMPORTANT: Don't hide split hands - just mark them as inactive
    // The split container stays visible until NEW HAND is clicked

    // Just reset the split flags, but leave the UI visible
    splitActive = false;
    // DON'T clear splitHand1 and splitHand2 - keep them visible
    splitHand1Done = true;  // Mark as done but keep displayed
    splitHand2Done = true;
    splitHand1DoubleUsed = false;
    splitHand2DoubleUsed = false;
    // Keep splitHand1Bet and splitHand2Bet values
    splitAces = false;
    currentSplitHandActive = 1;

    // Disable all split buttons (can't play them anymore)
    const allSplitBtns = document.querySelectorAll('.split-hit-btn, .split-stand-btn, .split-double-btn');
    allSplitBtns.forEach(btn => {
        btn.disabled = true;
    });

    // Keep the split container visible - DO NOT hide it
    // splitHandsContainer.style.display = 'none';  // REMOVED - keep visible

    // Keep main hand opacity dimmed
    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '0.4';
    }

    // DO NOT clear the card displays
    // splitHand1Cards.innerHTML = '';  // REMOVED
    // splitHand2Cards.innerHTML = '';  // REMOVED
}

function resetSplitState() {
    splitActive = false;
    splitHand1 = [];
    splitHand2 = [];
    splitHand1Done = false;
    splitHand2Done = false;
    splitHand1DoubleUsed = false;
    splitHand2DoubleUsed = false;
    splitHand1Bet = 0;
    splitHand2Bet = 0;
    splitAces = false;
    currentSplitHandActive = 1;

    // Hide split container
    if (splitHandsContainer) {
        splitHandsContainer.style.display = 'none';
    }

    // Reset main hand opacity
    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '1';
    }

    // Disable all split buttons
    const allSplitBtns = document.querySelectorAll('.split-hit-btn, .split-stand-btn, .split-double-btn');
    allSplitBtns.forEach(btn => btn.disabled = true);

    // Clear split cards
    if (splitHand1Cards) splitHand1Cards.innerHTML = '';
    if (splitHand2Cards) splitHand2Cards.innerHTML = '';
    if (splitHand1Score) splitHand1Score.innerText = '0';
    if (splitHand2Score) splitHand2Score.innerText = '0';
}

// Insurance Functions
function showInsurancePanel() {
    const maxInsurance = Math.floor(currentBet / 2);
    insuranceMessage.innerHTML = `🛡️ DEALER SHOWS ACE!<br>Insurance bet (up to ${maxInsurance} points) pays 2:1 if dealer has Blackjack.<br>Would you like to take insurance?`;
    insurancePanel.style.display = 'block';
    awaitingInsuranceDecision = true;
    gameActive = false;
    setButtonsState(false);
}

function hideInsurancePanel() {
    insurancePanel.style.display = 'none';
    awaitingInsuranceDecision = false;
}

function takeInsurance() {
    if (!awaitingInsuranceDecision) return;

    const maxInsurance = Math.floor(currentBet / 2);
    insuranceAmount = Math.min(maxInsurance, Math.floor(bank));

    if (insuranceAmount > 0 && bank >= insuranceAmount) {
        bank -= insuranceAmount;
        insuranceTaken = true;
        updateBankrollUI();

        const dealerHasBlackjack = isBlackjack(dealerHand);

        if (dealerHasBlackjack) {
            const insuranceProfit = insuranceAmount * 2;
            const insuranceTotalReturn = insuranceAmount + insuranceProfit;
            bank += insuranceTotalReturn;
            updateBankrollUI();
            addChatMessage(`💰 INSURANCE PAYS 2:1! Dealer has Blackjack. You bet ${insuranceAmount} and won ${insuranceProfit} points! Total returned: ${insuranceTotalReturn} points`, 'win');
        } else {
            addChatMessage(`❌ INSURANCE LOSS: Dealer does not have Blackjack. You lost ${insuranceAmount} points.`, 'loss');
        }
    } else {
        addChatMessage(`⚠️ Not enough points for insurance!`, 'system');
        insuranceTaken = false;
        insuranceAmount = 0;
    }

    hideInsurancePanel();

    setTimeout(() => {
        if (awaitingEvenMoneyDecision) return;
        continueAfterInsurance();
    }, 100);
}

function declineInsurance() {
    if (!awaitingInsuranceDecision) return;
    addChatMessage(`🛡️ INSURANCE DECLINED`, 'insurance');
    insuranceTaken = false;
    insuranceAmount = 0;
    hideInsurancePanel();

    setTimeout(() => {
        if (awaitingEvenMoneyDecision) return;
        continueAfterInsurance();
    }, 100);
}

function continueAfterInsurance() {
    if (isBlackjack(playerHand) && dealerShowingAce() && !evenMoneyTaken && !handResolved && !splitActive) {
        showEvenMoneyPanel();
        return;
    }

    const dealerHasBlackjack = isBlackjack(dealerHand);
    const playerHasBlackjack = isBlackjack(playerHand);

    if (dealerHasBlackjack && !splitActive) {
        gameActive = false;
        handResolved = false;

        if (playerHasBlackjack) {
            addChatMessage(`🃟 Both have Blackjack! PUSH - your bet is returned.`, 'push');
            bank += currentBet;
            updateBankrollUI();
        } else {
            addChatMessage(`💔 Dealer has Blackjack! You lose your ${currentBet} point bet.`, 'loss');
        }

        handResolved = true;
        gameInProgress = false;
        roundInProgress = false;

        handsPlayed++;
        updateHandsProgressBar();
        addChatMessage(`📊 Hand ${handsPlayed}/${MAX_HANDS} completed`, 'system');

        if (handsPlayed < MAX_HANDS && bank > 0) {
            newGameBtn.disabled = false;
            placeBetBtn.disabled = false;
            enableBetControls(true);
        }
        gameActive = false;
        gameInProgress = false;
        betPlaced = false;
        return;
    }

    if (!handResolved && !awaitingEvenMoneyDecision && !splitActive) {
        gameActive = true;
        setButtonsState(true);

        if (doubleDownUsed || playerHand.length !== 2) {
            doubleBtn.disabled = true;
        }

        if (calcHandValue(playerHand) === 21) {
            playerStand();
        }
    }
}

function showEvenMoneyPanel() {
    insuranceMessage.innerHTML = `💰 EVEN MONEY OFFER!<br>You have BLACKJACK and dealer shows an ACE.<br>Take even money for a guaranteed 1:1 payout (${currentBet} points) instead of risking a push?`;
    insurancePanel.style.display = 'block';
    awaitingEvenMoneyDecision = true;
    gameActive = false;
    setButtonsState(false);
}

function hideEvenMoneyPanel() {
    insurancePanel.style.display = 'none';
    awaitingEvenMoneyDecision = false;
}

function takeEvenMoney() {
    if (!awaitingEvenMoneyDecision) return;

    evenMoneyTaken = true;
    addChatMessage(`💰 EVEN MONEY TAKEN! You receive ${currentBet} points guaranteed.`, 'evenmoney');

    bank += currentBet;
    updateBankrollUI();

    handResolved = true;
    gameInProgress = false;
    roundInProgress = false;

    handsPlayed++;
    updateHandsProgressBar();
    addChatMessage(`📊 Hand ${handsPlayed}/${MAX_HANDS} completed (Even Money)`, 'system');

    hideEvenMoneyPanel();

    if (bank <= 0) {
        addChatMessage(`💀 GAME OVER! You're out of points! Click RESET GAME.`, 'loss');
        enableBetControls(false);
    } else if (handsPlayed < MAX_HANDS && bank > 0) {
        newGameBtn.disabled = false;
        placeBetBtn.disabled = false;
        enableBetControls(true);
        gameActive = false;
        gameInProgress = false;
        betPlaced = false;
    }

    insuranceTaken = false;
    insuranceAmount = 0;
    evenMoneyTaken = false;
    awaitingInsuranceDecision = false;
    awaitingEvenMoneyDecision = false;
}

function declineEvenMoney() {
    if (!awaitingEvenMoneyDecision) return;

    evenMoneyTaken = false;
    addChatMessage(`💰 EVEN MONEY DECLINED - Playing for full Blackjack payout!`, 'evenmoney');

    hideEvenMoneyPanel();

    if (!handResolved && !splitActive) {
        gameActive = true;
        setButtonsState(true);

        if (doubleDownUsed || playerHand.length !== 2) {
            doubleBtn.disabled = true;
        }

        if (calcHandValue(playerHand) === 21) {
            playerStand();
        }
    }
}

// Main Game Functions
async function dealerPlay() {
    waitingForDealer = true;
    gameActive = false;
    setButtonsState(false);
    addChatMessage("Dealer reveals hole card...", 'dealer');
    revealDealerHoleCard();
    await sleep(600);
    let dealerVal = calcHandValue(dealerHand);
    let dealerIsSoft17 = isSoftSeventeen(dealerHand);
    let message = dealerIsSoft17 ? `Dealer shows SOFT ${dealerVal} (A+6 = 17, stands on soft 17)` : `Dealer shows ${dealerVal}`;
    addChatMessage(message, 'dealer');
    await sleep(500);
    while (dealerVal < 17 || (dealerVal === 17 && !dealerIsSoft17)) {
        addChatMessage(`Dealer hits (${dealerVal}${dealerIsSoft17 ? ' hard' : ''})`, 'dealer');
        dealerHand.push(drawCardFromDeck());
        dealerVal = calcHandValue(dealerHand);
        dealerIsSoft17 = isSoftSeventeen(dealerHand);
        renderDealerHand();
        await sleep(600);
    }
    addChatMessage(`Dealer stands at ${dealerVal}${dealerIsSoft17 ? ' (soft 17)' : ''}`, 'dealer');
    await sleep(500);
    determineWinner();
    waitingForDealer = false;
    handResolved = true;
    gameInProgress = false;
    roundInProgress = false;
    setButtonsState(false);
    if (handsPlayed < MAX_HANDS && bank > 0) {
        newGameBtn.disabled = false;
        placeBetBtn.disabled = false;
        enableBetControls(true);
    }
}

function determineWinner() {
    const playerVal = calcHandValue(playerHand);
    const dealerVal = calcHandValue(dealerHand);
    let netChange = 0;
    const isPlayerBlackjack = isBlackjack(playerHand);
    const isDealerBlackjack = isBlackjack(dealerHand);

    if (evenMoneyTaken) {
        return;
    }

    if (playerVal > 21) {
        netChange = 0;
        addChatMessage(`❌ BUST! You lose ${currentBet} points`, 'loss');
    }
    else if (dealerVal > 21) {
        netChange = currentBet * 2;
        addChatMessage(`✅ WIN! Dealer busts. You win ${currentBet} points`, 'win');
    }
    else if (isPlayerBlackjack && !isDealerBlackjack) {
        netChange = currentBet + Math.floor(currentBet * 1.5);
        addChatMessage(`🃟 BLACKJACK! You win ${Math.floor(currentBet * 1.5)} points (3:2)`, 'blackjack');
    }
    else if (isDealerBlackjack && !isPlayerBlackjack) {
        netChange = 0;
        addChatMessage(`💔 Dealer has Blackjack! You lose ${currentBet} points`, 'loss');
    }
    else if (playerVal > dealerVal) {
        netChange = currentBet * 2;
        addChatMessage(`🏆 WIN! You win ${currentBet} points`, 'win');
    }
    else if (dealerVal > playerVal) {
        netChange = 0;
        addChatMessage(`💔 LOSS! Dealer wins. You lose ${currentBet} points`, 'loss');
    }
    else {
        netChange = currentBet;
        addChatMessage(`🤝 PUSH! Bet returned: ${currentBet} points`, 'push');
    }

    bank += netChange;
    if (bank < 0) bank = 0;
    updateBankrollUI();

    if (!handResolved && !evenMoneyTaken) {
        handsPlayed++;
        updateHandsProgressBar();
        addChatMessage(`📊 Hand ${handsPlayed}/${MAX_HANDS} completed`, 'system');
    }

    // Keep cards visible - don't clear them
    dealerHoleCardHidden = false; // Make sure dealer cards are revealed

    if (bank <= 0) {
        addChatMessage(`💀 GAME OVER! You're out of points! Click RESET GAME.`, 'loss');
        enableBetControls(false);
        gameActive = false;
        gameInProgress = false;
    } else {
        // Enable betting for next round but KEEP CARDS VISIBLE
        enableBetControls(true);
        placeBetBtn.disabled = false;
        newGameBtn.disabled = true;
        gameActive = false;
        gameInProgress = false;
        betPlaced = false;
    }

    handResolved = true;
    evenMoneyTaken = false;
    insuranceTaken = false;
}

async function playerHit() {
    if (!gameActive || handResolved || waitingForDealer || doubleDownUsed || awaitingInsuranceDecision || awaitingEvenMoneyDecision || splitActive) return;
    addChatMessage(`🎴 You HIT`, 'player');
    playerHand.push(drawCardFromDeck());
    renderPlayerHand();
    const playerVal = calcHandValue(playerHand);
    addChatMessage(`Your hand value: ${playerVal}`, 'player');
    if (playerVal > 21) {
        gameActive = false; handResolved = false;
        revealDealerHoleCard(); await sleep(500);
        determineWinner(); gameInProgress = false; roundInProgress = false; setButtonsState(false);
        if (handsPlayed < MAX_HANDS && bank > 0) { newGameBtn.disabled = false; placeBetBtn.disabled = false; enableBetControls(true); }
    }
}

async function playerStand() {
    if (!gameActive || handResolved || waitingForDealer || awaitingInsuranceDecision || awaitingEvenMoneyDecision || splitActive) return;
    addChatMessage(`✋ You STAND with ${calcHandValue(playerHand)}`, 'player');
    gameActive = false; setButtonsState(false); await dealerPlay();
}

async function playerDouble() {
    if (!gameActive || handResolved || waitingForDealer || doubleDownUsed || playerHand.length !== 2 || bank < currentBet || awaitingInsuranceDecision || awaitingEvenMoneyDecision || splitActive) return;
    addChatMessage(`⚡ DOUBLE DOWN! Bet increased to ${currentBet * 2} points`, 'player');
    bank -= currentBet; updateBankrollUI();
    currentBet = currentBet * 2; updateBetUI();
    doubleDownUsed = true;
    playerHand.push(drawCardFromDeck()); renderPlayerHand();
    const playerVal = calcHandValue(playerHand);
    addChatMessage(`Your hand value after double: ${playerVal}`, 'player');
    if (playerVal > 21) {
        gameActive = false;
        revealDealerHoleCard(); await sleep(500);
        determineWinner(); gameInProgress = false; roundInProgress = false; setButtonsState(false);
        if (handsPlayed < MAX_HANDS && bank > 0) { newGameBtn.disabled = false; placeBetBtn.disabled = false; enableBetControls(true); }
    } else { gameActive = false; setButtonsState(false); await dealerPlay(); }
}

function checkForInsurance() {
    if (dealerShowingAce() && !awaitingInsuranceDecision && !awaitingEvenMoneyDecision && !handResolved && gameInProgress && !splitActive) {
        if (isBlackjack(playerHand)) {
            showEvenMoneyPanel();
        } else {
            showInsurancePanel();
        }
        return true;
    }
    return false;
}

function startNewRound() {
    // CRITICAL: This is where we clear the split hands UI
    if (splitActive || splitHandsContainer.style.display === 'block') {
        // Clear split hands display
        if (splitHand1Cards) splitHand1Cards.innerHTML = '';
        if (splitHand2Cards) splitHand2Cards.innerHTML = '';
        if (splitHand1Score) splitHand1Score.innerText = '0';
        if (splitHand2Score) splitHand2Score.innerText = '0';
        splitHandsContainer.style.display = 'none';
    }

    if (!betPlaced || currentBet <= 0 || bank < currentBet || handsPlayed >= MAX_HANDS) return;

    // Reset ALL game states including cards (clear for new round)
    insuranceTaken = false;
    insuranceAmount = 0;
    evenMoneyTaken = false;
    awaitingInsuranceDecision = false;
    awaitingEvenMoneyDecision = false;
    hideInsurancePanel();

    // Reset main hand opacity
    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '1';
    }

    // Reset split container display
    splitHandsContainer.style.display = 'none';

    // Reset all split variables
    splitActive = false;
    splitHand1 = [];
    splitHand2 = [];
    splitHand1Done = false;
    splitHand2Done = false;
    splitHand1DoubleUsed = false;
    splitHand2DoubleUsed = false;
    splitHand1Bet = 0;
    splitHand2Bet = 0;
    splitAces = false;
    currentSplitHandActive = 1;

    addChatMessage(`🎲 NEW ROUND - Bet: ${currentBet} points`, 'system');
    bank -= currentBet;
    updateBankrollUI();

    // Create fresh deck and hands (THIS CLEARS THE CARDS)
    deck = createDeck();
    playerHand = [];
    dealerHand = [];
    gameActive = true;
    waitingForDealer = false;
    handResolved = false;
    doubleDownUsed = false;
    dealerHoleCardHidden = true; // Reset to hidden for new round
    gameInProgress = true;
    roundInProgress = true;

    // Deal cards
    playerHand.push(drawCardFromDeck());
    dealerHand.push(drawCardFromDeck());
    playerHand.push(drawCardFromDeck());
    dealerHand.push(drawCardFromDeck());

    renderPlayerHand();
    renderDealerHand();

    let playerVal = calcHandValue(playerHand);
    addChatMessage(`Your initial hand: ${playerVal}`, 'player');

    // Enable split button if pair
    if (isPair(playerHand) && !splitActive && bank >= currentBet) {
        splitBtn.disabled = false;
    } else {
        splitBtn.disabled = true;
    }

    // Check for insurance/even money
    const insuranceOffered = checkForInsurance();

    if (!insuranceOffered) {
        if (playerVal === 21) {
            gameActive = false;
            setTimeout(async () => {
                revealDealerHoleCard();
                await sleep(800);
                determineWinner();
                setButtonsState(false);
                if (handsPlayed < MAX_HANDS && bank > 0) {
                    newGameBtn.disabled = false;
                    placeBetBtn.disabled = false;
                    enableBetControls(true);
                    gameInProgress = false;
                    betPlaced = false;
                }
            }, 100);
        } else {
            gameActive = true;
            setButtonsState(true);
            newGameBtn.disabled = true;
            placeBetBtn.disabled = true;
            enableBetControls(false);

            if (doubleDownUsed || playerHand.length !== 2) {
                doubleBtn.disabled = true;
            }
        }
    } else {
        gameActive = false;
        setButtonsState(false);
        newGameBtn.disabled = true;
        placeBetBtn.disabled = true;
        enableBetControls(false);
        splitBtn.disabled = true;
    }
}

function setButtonsState(active) {
    hitBtn.disabled = !active;
    standBtn.disabled = !active;
    doubleBtn.disabled = !active;
    if (active && (playerHand.length !== 2 || doubleDownUsed)) doubleBtn.disabled = true;
    if (active && (bank < currentBet)) doubleBtn.disabled = true;
    if (active && isPair(playerHand) && !splitActive && bank >= currentBet) {
        splitBtn.disabled = false;
    } else if (!active) {
        splitBtn.disabled = true;
    }
}

function enableBetControls(enable) {
    betPlusBtn.disabled = !enable;
    betMinusBtn.disabled = !enable;
    placeBetBtn.disabled = !enable;
    if (enable && bank <= 0) { betPlusBtn.disabled = true; betMinusBtn.disabled = true; placeBetBtn.disabled = true; }
}

function placeBetAction() {
    // CRITICAL: Check if we can place a bet
    if (gameInProgress || gameActive || waitingForDealer || splitActive) {
        addChatMessage(`⚠️ Cannot place bet while a game is in progress!`, 'system');
        return;
    }

    if (handsPlayed >= MAX_HANDS) {
        addChatMessage(`🏆 You've completed all ${MAX_HANDS} hands! Press RESET GAME to play again.`, 'system');
        return;
    }

    if (currentBet < 25) {
        addChatMessage(`Minimum bet is 25 points!`, 'system');
        return;
    }

    if (currentBet > bank) {
        addChatMessage(`Bet exceeds points! You have ${bank} points.`, 'system');
        return;
    }

    // Reset any lingering states
    if (handResolved || !gameInProgress) {
        betPlaced = true;
        addChatMessage(`✅ Bet placed: ${currentBet} points`, 'system');
        newGameBtn.disabled = false;
        placeBetBtn.disabled = true;

        // Make sure game is ready for new round
        gameInProgress = false;
        gameActive = false;
        handResolved = true;
    } else {
        addChatMessage(`⚠️ Wait for current hand to finish!`, 'system');
    }
}

function resetGame() {
    bank = 1000; handsPlayed = 0; currentBet = 50; betPlaced = false; doubleDownUsed = false;
    handResolved = false; dealerHoleCardHidden = true; gameInProgress = false; gameActive = false;
    waitingForDealer = false; playerHand = []; dealerHand = [];

    insuranceTaken = false;
    insuranceAmount = 0;
    evenMoneyTaken = false;
    awaitingInsuranceDecision = false;
    awaitingEvenMoneyDecision = false;
    hideInsurancePanel();
    resetSplitState();

    updateBankrollUI(); updateBetUI(); updateHandsProgressBar();
    renderPlayerHand(); renderDealerHand();
    playerScoreSpan.innerText = "0"; dealerScoreSpan.innerText = "?";
    setButtonsState(false); enableBetControls(true);
    newGameBtn.disabled = true; placeBetBtn.disabled = false;
    splitBtn.disabled = true;
    addChatMessage(`🔄 GAME RESET! New points: 1000, 0/${MAX_HANDS} hands played`, 'system');
}

function adjustBet(delta) {
    if (gameInProgress || gameActive || waitingForDealer) return;
    if (betPlaced) { betPlaced = false; placeBetBtn.disabled = false; newGameBtn.disabled = true; addChatMessage(`Bet adjusted`, 'system'); }
    let newBet = currentBet + delta;
    if (newBet < 25) newBet = 25;
    if (newBet > bank) newBet = bank;
    currentBet = newBet; updateBetUI();
}

// Event Listeners
hitBtn.addEventListener('click', playerHit);
standBtn.addEventListener('click', playerStand);
doubleBtn.addEventListener('click', playerDouble);
splitBtn.addEventListener('click', performSplit);
placeBetBtn.addEventListener('click', placeBetAction);
betPlusBtn.addEventListener('click', () => adjustBet(25));
betMinusBtn.addEventListener('click', () => adjustBet(-25));
resetGameBtn.addEventListener('click', resetGame);
clearChatBtn.addEventListener('click', clearChatLog);
// Fixed NEW GAME button handler
newGameBtn.addEventListener('click', () => {
    // Complete safety check - reset any stuck split state
    if (splitActive) {
        resetSplitState();
    }

    // Hide split container if visible
    if (splitHandsContainer) {
        splitHandsContainer.style.display = 'none';
    }

    // Reset main hand opacity
    const mainHandSection = document.getElementById('playerMainArea');
    if (mainHandSection) {
        mainHandSection.style.opacity = '1';
    }

    // Enable all split buttons visually
    const allSplitBtns = document.querySelectorAll('.split-hit-btn, .split-stand-btn, .split-double-btn');
    allSplitBtns.forEach(btn => btn.disabled = true);

    // Log current state for debugging
    console.log("New Game Clicked - State:", {
        gameInProgress, gameActive, waitingForDealer, betPlaced, bank, handsPlayed, currentBet
    });

    // Start new round if conditions met
    if (!gameInProgress && !gameActive && !waitingForDealer && betPlaced && bank > 0 && handsPlayed < MAX_HANDS && currentBet <= bank) {
        startNewRound();
    } else if (handsPlayed >= MAX_HANDS) {
        addChatMessage(`🏆 You've completed all ${MAX_HANDS} hands! Press RESET GAME to play again.`, 'system');
    } else if (!betPlaced) {
        addChatMessage(`⚠️ Please place a bet first!`, 'system');
    } else if (bank < currentBet) {
        addChatMessage(`⚠️ Insufficient funds! Current bet (${currentBet}) exceeds your bank (${bank}). Adjust your bet or reset.`, 'system');
    } else if (gameInProgress) {
        addChatMessage(`⚠️ A game is already in progress! Complete or reset.`, 'system');
    }
});

// Split hand button listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('split-hit-btn')) {
        const handNum = parseInt(e.target.getAttribute('data-hand'));
        splitHandHit(handNum);
    } else if (e.target.classList.contains('split-stand-btn')) {
        const handNum = parseInt(e.target.getAttribute('data-hand'));
        splitHandStand(handNum);
    } else if (e.target.classList.contains('split-double-btn')) {
        const handNum = parseInt(e.target.getAttribute('data-hand'));
        splitHandDouble(handNum);
    }
});

insuranceYesBtn.addEventListener('click', takeInsurance);
insuranceNoBtn.addEventListener('click', declineInsurance);

function init() {
    bank = 1000; currentBet = 50; handsPlayed = 0; gameInProgress = false;
    updateBankrollUI(); updateBetUI(); updateHandsProgressBar();
    betPlaced = false; gameActive = false; playerHand = []; dealerHand = [];
    renderPlayerHand(); renderDealerHand(); setButtonsState(false); enableBetControls(true);
    newGameBtn.disabled = true; placeBetBtn.disabled = false;
    splitBtn.disabled = true;
    hideInsurancePanel();
    insuranceTaken = false;
    evenMoneyTaken = false;
    resetSplitState();
}

init();