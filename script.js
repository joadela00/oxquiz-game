const originalQuizData = [
    { question: "모니터링은 평일 7일간 진행한다", answer: false },
    { question: "모니터링은 평일 6일간 진행한다", answer: true },
    { question: "계속 벨이 울리면 끊어질때까지 기다린다", answer: false },
    { question: "전화를 끊고나면 바로 행지에 알려준다", answer: true },
    { question: "출근하면 시나리오를 켜놓는다", answer: true },
    { question: "첫인사는 '여보세요?'라고 한다", answer: false },
    { question: "나 하나쯤은 대충 받아도 끄떡 없다", answer: false },
    { question: "첫인사+끝인사는 45점을 차지한다", answer: true },
    { question: "친근하게 반말을 섞어도 된다", answer: false },
    { question: "돌려주기는 가급적 하지 않는다", answer: true },
    { question: "2차수신 시, 용무인지는 선택사항이다", answer: false },
    { question: "끝인사는 '네~'라고 짧게 한다", answer: false },
    { question: "첫인사는 발음이 중요하지 않다", answer: false },
    { question: "바쁘니까 고객보다 먼저 끊는다", answer: false },
    { question: "전화를 돌리면 보너스 점수를 받는다", answer: false },
    { question: "모니터링 전화냐고 반드시 되물어본다", answer: false },
    { question: "엉덩이를 떼면 이석을 누른다", answer: true },
    { question: "모니터링으로 표창을 받을 수 있다", answer: true },
    { question: "모든 질문은 시나리오대로만 한다", answer: true },
    { question: "전화를 넘기면 뒷사람만 평가받는다", answer: false },
    { question: "2차수신 시, 용무인지는 선택사항이다", answer: false },
    { question: "2차수신자는 이름을 생략할 수 있다", answer: false },
    { question: "업무전화에서 직원의 이름은 비공개대상이다", answer: false },
    { question: "모니터링은 아침 9시반부터 시작한다", answer: true },
    { question: "팀원이 전화를 받는동안 큰소리로 응원전을 펼친다", answer: false },
    { question: "이 시기, 빈자리 이석을 눌러주면 국제법 위반이다", answer: false },
    { question: "당겨받기는 귀여운 막내만 담당한다", answer: false },
    { question: "전화를 망치면 행지엔 비밀로 한다", answer: false },
    { question: "점심시간에는 모니터링을 하지 않는다", answer: true }
];

let shuffledQuizData = [];
let currentPlayerId = '';

const preQuizScreen = document.getElementById('pre-quiz-screen');
const buttonsContainer = document.querySelector('.buttons');
const quizScreen = document.getElementById('quiz-screen');
const employeeIdInput = document.getElementById('employee-id-input');
const startQuizButton = document.getElementById('start-quiz-btn');

const questionElement = document.getElementById('question');
const oButton = document.getElementById('o-button');
const xButton = document.getElementById('x-button');
const resultMessageElement = document.getElementById('result-message');
const scoreDisplay = document.getElementById('score-display');
const timerElement = document.getElementById('timer');
const questionCounterElement = document.getElementById('question-counter');

const rankingSectionFinal = document.getElementById('ranking-section-final');
const finalRankingList = document.getElementById('final-ranking-list');

const initialRankingList = document.getElementById('initial-ranking-list');
const showInitialRankingButton = document.getElementById('show-initial-ranking-btn');

const restartButton = document.getElementById('restart-button');

const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertTitle = document.getElementById('custom-alert-title');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');

const rankingModalOverlay = document.getElementById('ranking-modal-overlay');
const rankingModalCloseBtn = document.getElementById('ranking-modal-close-btn');

let currentQuizIndex = 0;
let score = 0;
let timeLeft = 10;
let timerId;
let quizStartTime;
let quizEndTime;

const APPS_SCRIPT_RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbz6yr3pxzXdPGSg8mHmo6FSYrrAs68LT4G0_EbdhyaUGsb0EQSpHrJrjMF1K3X82SId4A/exec';

function customAlert(title, message) {
    customAlertTitle.textContent = title;
    customAlertMessage.textContent = message;
    customAlertOverlay.style.display = 'flex';
}

customAlertOkBtn.addEventListener('click', () => {
    customAlertOverlay.style.display = 'none';
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuizProcess() {
    currentPlayerId = employeeIdInput.value.trim();
    if (currentPlayerId === '') {
        customAlert('사번 입력 오류', '사번이 필요해요!');
        return;
    }
    const sixDigitsPattern = /^\d{6}$/;
    const letterAndFiveDigitsPattern = /^[a-zA-Z]\d{5}$/;
    if (!(sixDigitsPattern.test(currentPlayerId) || letterAndFiveDigitsPattern.test(currentPlayerId))) {
        customAlert('사번 오류', '올바른 사번을 넣어주세요');
        return;
    }
    preQuizScreen.style.display = 'none';
    quizScreen.style.display = 'flex';
    const tempShuffled = shuffleArray([...originalQuizData]);
    shuffledQuizData = tempShuffled.slice(0, 5);
    currentQuizIndex = 0;
    score = 0;
    quizStartTime = new Date().getTime();
    oButton.style.display = 'inline-block';
    xButton.style.display = 'inline-block';
    rankingSectionFinal.style.display = 'none';
    scoreDisplay.style.display = 'block';
    questionCounterElement.style.display = 'block';
    rankingModalOverlay.style.display = 'none';
    quizScreen.classList.remove('quiz-finished-bg');
    resultMessageElement.textContent = '';
    resultMessageElement.style.opacity = '0'; 
    loadQuiz();
}

function loadQuiz() {
    clearInterval(timerId);
    resultMessageElement.textContent = '';
    resultMessageElement.style.opacity = '0';

    oButton.classList.remove('correct-btn', 'incorrect-btn');
    xButton.classList.remove('correct-btn', 'incorrect-btn');
    oButton.style.border = '3px solid transparent';
    xButton.style.border = '3px solid transparent';
    oButton.style.backgroundColor = 'transparent';
    xButton.style.backgroundColor = 'transparent';

    oButton.disabled = false;
    xButton.disabled = false;
    timerElement.style.color = '#333';

// ✨✨✨ O/X 버튼 위치 랜덤으로 섞기 시작 (v2.0 - CSS order 강제)! ✨✨✨
    if (buttonsContainer && oButton && xButton) { // 혹시 모르니 버튼 요소들이 있는지 체크!
        if (Math.random() < 0.5) {
            // 50% 확률로 O버튼이 먼저 오도록 (visual order)
            oButton.style.order = '1';
            xButton.style.order = '2';
        } else {
            // 나머지 50% 확률로 X버튼이 먼저 오도록 (visual order)
            oButton.style.order = '2';
            xButton.style.order = '1';
        }
    }
    // ✨✨✨ O/X 버튼 위치 랜덤으로 섞기 끝! ✨✨✨


    if (currentQuizIndex < shuffledQuizData.length) {
        const currentQuiz = shuffledQuizData[currentQuizIndex];
        questionElement.textContent = currentQuiz.question;
        scoreDisplay.textContent = `점수: ${score}`;
        timerElement.textContent = `남은 시간: ${timeLeft}초`;
        timerElement.style.display = 'block';
        questionCounterElement.textContent = `${currentQuizIndex + 1} / ${shuffledQuizData.length} 문제`;
        questionElement.style.marginTop = '20px';

        timeLeft = 10;
        timerElement.textContent = `남은 시간: ${timeLeft}초`;

        timerId = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `남은 시간: ${timeLeft}초`;
            if (timeLeft <= 5) {
                timerElement.style.color = '#e74c3c';
            }
            if (timeLeft <= 0) {
                clearInterval(timerId);
                resultMessageElement.textContent = '💤';
                resultMessageElement.style.color = '#e74c3c';
                resultMessageElement.style.opacity = '1';
                oButton.disabled = true;
                xButton.disabled = true;
                scoreDisplay.textContent = `점수: ${score}`;
                setTimeout(() => {
                    currentQuizIndex++;
                    loadQuiz();
                }, 2000);
            }
        }, 1000);
    } else {
        quizEndTime = new Date().getTime();
        const totalTimeTakenMillis = quizEndTime - quizStartTime;
        const totalTimeTakenFormatted = (totalTimeTakenMillis / 1000).toFixed(2);
        resultMessageElement.style.opacity = '1';
        questionElement.textContent = '';
        questionElement.style.overflow = ''; 
        resultMessageElement.textContent = `최종: ${score}점 (${totalTimeTakenFormatted}초)`;
        resultMessageElement.style.color = '#333';
        oButton.style.display = 'none';
        xButton.style.display = 'none';
        timerElement.style.display = 'none';
        scoreDisplay.style.display = 'none';
        questionCounterElement.style.display = 'none';
        quizScreen.classList.add('quiz-finished-bg');

        const googleFormBaseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdnP979PWZO0YLJBS9QXwbjdPL6efLNCZjFLVvepVS3cd8GIA/formResponse';
        const entryIdEmployeeId = 'entry.886611971';
        const entryIdScore = 'entry.1024204280';
        const entryIdTime = 'entry.1174827518';

        const formData = new FormData();
        formData.append(entryIdEmployeeId, currentPlayerId);
        formData.append(entryIdScore, score);
        formData.append(entryIdTime, totalTimeTakenMillis);

        fetch(googleFormBaseUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        })
        .then(response => {
            console.log('Google Forms로 데이터 전송 요청 완료');
            fetchAndDisplayRankings();
        })
        .catch(error => {
            console.error('Google Forms 데이터 전송 실패:', error);
            fetchAndDisplayRankings();
        });

        rankingSectionFinal.style.position = 'relative';
        rankingSectionFinal.style.zIndex = '3';
        rankingSectionFinal.style.display = 'block';
    }
}

async function fetchAndDisplayRankings() {
    try {
        const response = await fetch(APPS_SCRIPT_RANKING_API_URL);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }
        const rankings = await response.json();
        
        if (rankings.error) {
            console.error("Apps Script Error:", rankings.error);
            displayRankingsToDOM([], finalRankingList, true);
            displayRankingsToDOM([], initialRankingList, true);
            return;
        }

        displayRankingsToDOM(rankings, finalRankingList);
        displayRankingsToDOM(rankings, initialRankingList);

    } catch (error) {
        console.error('랭킹 데이터를 가져오는데 실패했습니다:', error);
        displayRankingsToDOM([], finalRankingList, true);
        displayRankingsToDOM([], initialRankingList, true);
    }
}

function displayRankingsToDOM(rankings, targetListElement, showError = false) {
    targetListElement.innerHTML = '';
    if (showError) {
        targetListElement.innerHTML = '<li>랭킹을 불러오는데 실패했습니다.</li>';
        return;
    }
    if (rankings.length === 0) {
        targetListElement.innerHTML = '<li>첫 기록을 남겨보세요!</li>';
        return;
    }
    const limitedRankings = rankings.slice(0, 10);
    limitedRankings.forEach((entry, index) => {
        const timeTakenFormatted = (entry.timeTakenMillis / 1000).toFixed(2);
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="rank-number">${index + 1}위</span>
            <span class="player-info">${entry.affiliation} ${entry.employeeId}</span>
            <span class="score-time">${entry.score}점(${timeTakenFormatted}초)</span>
        `;
        targetListElement.appendChild(listItem);
    });
}

startQuizButton.addEventListener('click', startQuizProcess);
oButton.addEventListener('click', () => checkAnswer(true));
xButton.addEventListener('click', () => checkAnswer(false));

showInitialRankingButton.addEventListener('click', () => {
    fetchAndDisplayRankings();
    rankingModalOverlay.style.display = 'flex';
});

rankingModalCloseBtn.addEventListener('click', () => {
    rankingModalOverlay.style.display = 'none';
});

restartButton.addEventListener('click', () => {
    preQuizScreen.style.display = 'flex';
    quizScreen.style.display = 'none';
    employeeIdInput.value = '';
    questionElement.style.overflow = ''; 
    questionElement.textContent = '';
    rankingModalOverlay.style.display = 'none';
    quizScreen.classList.remove('quiz-finished-bg');
    rankingSectionFinal.style.position = '';
    rankingSectionFinal.style.zIndex = '';
    rankingSectionFinal.style.display = 'none';
    resultMessageElement.textContent = '';
    resultMessageElement.style.opacity = '0';
    oButton.classList.remove('correct-btn', 'incorrect-btn');
    xButton.classList.remove('correct-btn', 'incorrect-btn');
    oButton.style.border = '3px solid transparent';
    xButton.style.border = '3px solid transparent';
    oButton.style.backgroundColor = 'transparent';
    xButton.style.backgroundColor = 'transparent';
    fetchAndDisplayRankings();
});

function checkAnswer(userAnswer) {
    clearInterval(timerId);
    oButton.disabled = true;
    xButton.disabled = true;

    let selectedButton;
    if (userAnswer === true) {
        selectedButton = oButton;
    } else {
        selectedButton = xButton;
    }

    const currentQuiz = shuffledQuizData[currentQuizIndex];
    if (userAnswer === currentQuiz.answer) {
        resultMessageElement.textContent = '💚💚💚';
        resultMessageElement.style.color = '#27ae60';
        score++;
        selectedButton.classList.add('correct-btn');
        selectedButton.style.backgroundColor = 'rgba(39, 174, 96, 0.4)';
    } else {
        resultMessageElement.textContent = '💔';
        resultMessageElement.style.color = '#e74c3c';
        selectedButton.classList.add('incorrect-btn');
        selectedButton.style.backgroundColor = 'rgba(231, 76, 60, 0.4)';
    }
    resultMessageElement.style.opacity = '1';
    scoreDisplay.textContent = `점수: ${score}`;

    setTimeout(() => {
        resultMessageElement.style.opacity = '0';
        selectedButton.classList.remove('correct-btn', 'incorrect-btn');
        selectedButton.style.border = '3px solid transparent';
        selectedButton.style.backgroundColor = 'transparent';
        
        setTimeout(() => {
            currentQuizIndex++;
            loadQuiz();
        }, 0);
    }, 2000);
}

preQuizScreen.style.display = 'flex';
quizScreen.style.display = 'none';
rankingModalOverlay.style.display = 'none';

resultMessageElement.textContent = '';
resultMessageElement.style.opacity = '0';

oButton.classList.remove('correct-btn', 'incorrect-btn');
xButton.classList.remove('correct-btn', 'incorrect-btn');
oButton.style.border = '3px solid transparent';
xButton.style.border = '3px solid transparent';
oButton.style.backgroundColor = 'transparent';
xButton.style.backgroundColor = 'transparent';

fetchAndDisplayRankings();