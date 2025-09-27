/* 코드를 읽는 건 너무 야비해요 */

const originalQuizData = [
   {
question: "모니터링은 평일 7일간 진행한다",
answer: false
},
{
question: "계속 벨이 울리면 끊어질때까지 기다린다",
answer: false
},
{
question: "전화를 끊고나면 바로 행지팀에 알려준다",
answer: true
},
{
question: "출근하면 시나리오를 켜놓는다",
answer: true
},
{
question: "첫인사는 '여보세요?'라고 한다",
answer: false
},
{
question: "나 하나쯤은 대충 받아도 끄떡 없다",
answer: false
},
{
question: "첫인사+끝인사는 45점을 차지한다",
answer: true
},
{
question: "친근하게 반말을 섞어도 된다",
answer: false
},
{
question: "돌려주기는 가급적 하지 않는다",
answer: true
},
{
question: "2차수신 시, 용무인지는 선택사항이다",
answer: false
},
{
question: "끝인사는 '네~'라고 짧게 한다",
answer: false
},
{
question: "첫인사는 발음이 중요하지 않다",
answer: false
},
{
question: "바쁘니까 고객보다 먼저 끊는다",
answer: false
},
{
question: "전화를 돌리면 보너스 점수를 받는다",
answer: false
},
{
question: "모니터링 전화냐고 반드시 되물어본다",
answer: false
},
{
question: "엉덩이를 떼면 이석을 누른다",
answer: true
},
{
question: "모니터링으로 표창을 받을 수 있다",
answer: true
},
{
question: "모든 질문은 시나리오대로만 한다",
answer: true
},
{
question: "2차수신보다 메모가 낫다",
answer: true
},
{
question: "2차수신자는 이름을 생략할 수 있다",
answer: false
},
{
question: "업무전화에서 직원의 이름은 비공개대상이다",
answer: false
},
{
question: "모니터링은 아침 9시반부터 시작한다",
answer: true
},
{
question: "팀원이 전화를 받는동안 큰소리로 응원전을 펼친다",
answer: false
},
{
question: "이 시기, 빈자리 이석을 눌러주면 국제법 위반이다",
answer: false
},
{
question: "당겨받기는 귀여운 막내가 담당한다",
answer: false
},
{
question: "전화를 망치면 행지팀에 비밀로 한다",
answer: FALSE
},
{
question: "점심시간에는 모니터링을 하지 않는다",
answer: TRUE
}
];

let shuffledQuizData = [];
let currentPlayerId = '';

const preQuizScreen = document.getElementById('pre-quiz-screen');
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
        customAlert('사번 입력 오류', '사번을 입력해주세요!');
        return;
    }

    if (!/^\d{6}$/.test(currentPlayerId)) {
        customAlert('사번 유효성 오류', '사번을 확인하세요! (6자리 숫자)');
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
    
    // 퀴즈 시작 시 #quiz-screen의 배경을 기본 배경으로 설정 (quiz-finished-bg 클래스 제거)
    quizScreen.classList.remove('quiz-finished-bg');

    loadQuiz();
}

function loadQuiz() {
    clearInterval(timerId);

    resultMessageElement.textContent = '';
    oButton.disabled = false;
    xButton.disabled = false;
    timerElement.style.color = '#333';

    if (currentQuizIndex < shuffledQuizData.length) {
        const currentQuiz = shuffledQuizData[currentQuizIndex];
        
        questionElement.textContent = currentQuiz.question;
        scoreDisplay.textContent = `점수: ${score}`;
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
                resultMessageElement.textContent = '시간 초과! EMOJI_0 오답입니다.';
                resultMessageElement.style.color = '#e74c3c';
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

        // "모든 문제를 다 풀었습니다!" 문구를 여기서 제거합니다.
        questionElement.textContent = ''; 
        // 텍스트를 비웠으니, h1이 공간을 차지하지 않도록 추가로 조정
        questionElement.style.height = '0';
        questionElement.style.overflow = 'hidden';

        resultMessageElement.textContent = `최종 점수: ${score} / ${shuffledQuizData.length}점, 소요 시간: ${totalTimeTakenFormatted}초`;
        resultMessageElement.style.color = '#333';

        oButton.style.display = 'none';
        xButton.style.display = 'none';
        timerElement.style.display = 'none';
        scoreDisplay.style.display = 'none';
        questionCounterElement.style.display = 'none';
        
        // 퀴즈 종료 시 #quiz-screen의 배경을 background2.jpg로 변경 (class 추가)
        quizScreen.classList.add('quiz-finished-bg');

        saveRanking(currentPlayerId, score, totalTimeTakenMillis);

        displayRanking(finalRankingList);
        rankingSectionFinal.style.position = 'relative';
        rankingSectionFinal.style.zIndex = '3';
        rankingSectionFinal.style.display = 'block';
    }
}

function saveRanking(employeeId, score, timeTakenMillis) {
    let rankings = JSON.parse(localStorage.getItem('oxQuizRankings')) || [];
    const newEntry = { employeeId, score, timeTakenMillis };

    const existingEntryIndex = rankings.findIndex(entry => entry.employeeId === employeeId);

    if (existingEntryIndex > -1) {
        const existingEntry = rankings[existingEntryIndex];
        if (newEntry.score > existingEntry.score ||
           (newEntry.score === existingEntry.score && newEntry.timeTakenMillis < existingEntry.timeTakenMillis)) {
            rankings[existingEntryIndex] = newEntry;
        }
    } else {
        rankings.push(newEntry);
    }

    rankings.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.timeTakenMillis - b.timeTakenMillis;
    });

    localStorage.setItem('oxQuizRankings', JSON.stringify(rankings));
}

function displayRanking(targetListElement) {
    const rankings = JSON.parse(localStorage.getItem('oxQuizRankings')) || [];
    targetListElement.innerHTML = '';

    if (rankings.length === 0) {
        targetListElement.innerHTML = '<li>랭킹 데이터가 없습니다. 첫 기록을 남겨보세요!</li>';
        return;
    }

    const limitedRankings = rankings.slice(0, 10);

    limitedRankings.forEach((entry, index) => {
        const timeTakenFormatted = (entry.timeTakenMillis / 1000).toFixed(2);
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="rank-number">${index + 1}위</span>
            <span class="player-info">${entry.employeeId}</span>
            <span class="score-time">${entry.score}점 / ${timeTakenFormatted}초</span>
        `;
        targetListElement.appendChild(listItem);
    });
}

startQuizButton.addEventListener('click', startQuizProcess);
oButton.addEventListener('click', () => checkAnswer(true));
xButton.addEventListener('click', () => checkAnswer(false));

showInitialRankingButton.addEventListener('click', () => {
    displayRanking(initialRankingList);
    rankingModalOverlay.style.display = 'flex';
});

rankingModalCloseBtn.addEventListener('click', () => {
    rankingModalOverlay.style.display = 'none';
});

restartButton.addEventListener('click', () => {
    preQuizScreen.style.display = 'flex';
    quizScreen.style.display = 'none';
    employeeIdInput.value = '';
    
    // 최종 화면에서 설정된 스타일 초기화
    questionElement.style.height = ''; // 높이 초기화
    questionElement.style.overflow = ''; // overflow 초기화
    questionElement.textContent = ''; // 텍스트 초기화 (혹시 모를 잔여 텍스트)

    rankingModalOverlay.style.display = 'none';
    quizScreen.classList.remove('quiz-finished-bg');
    rankingSectionFinal.style.position = '';
    rankingSectionFinal.style.zIndex = '';
});

function checkAnswer(userAnswer) {
    clearInterval(timerId);
    oButton.disabled = true;
    xButton.disabled = true;

    const currentQuiz = shuffledQuizData[currentQuizIndex];
    if (userAnswer === currentQuiz.answer) {
        resultMessageElement.textContent = '정답입니다! EMOJI_1';
        resultMessageElement.style.color = '#27ae60';
        score++;
    } else {
        resultMessageElement.textContent = '오답입니다... EMOJI_2';
        resultMessageElement.style.color = '#e74c3c';
    }
    scoreDisplay.textContent = `점수: ${score}`;

    setTimeout(() => {
        currentQuizIndex++;
        loadQuiz();
    }, 2000);
}

preQuizScreen.style.display = 'flex';
quizScreen.style.display = 'none';
rankingModalOverlay.style.display = 'none';