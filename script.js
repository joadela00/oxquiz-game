
const originalQuizData = [
    {
        question: "서울은 대한민국의 수도이다.",
        answer: true
    },
    {
        question: "지구는 평평하다.",
        answer: false
    },
    {
        question: "물은 100도에서 끓는다. (해수면 기준)",
        answer: true
    },
    {
        question: "대한민국은 삼면이 바다로 둘러싸여 있다.",
        answer: true
    },
    {
        question: "바나나는 나무에서 열리는 과일이다.",
        answer: false
    },
    {
        question: "이 꽃은 무궁화인가요?",
        answer: true
    },
    {
        question: "고양이는 발톱을 숨길 수 있다.",
        answer: true
    },
    {
        question: "이 동물은 코끼리인가요?",
        answer: false
    },
    {
        question: "대한민국의 국화는 무궁화이다.",
        answer: true
    },
    {
        question: "하늘은 언제나 파란색이다.",
        answer: false
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

// 초기 랭킹 섹션은 이제 팝업 모달 안에 있습니다.
// const rankingSectionInitial = document.getElementById('ranking-section-initial'); // 이 요소는 더 이상 필요 없음
const initialRankingList = document.getElementById('initial-ranking-list'); // 팝업 내 랭킹 리스트
const showInitialRankingButton = document.getElementById('show-initial-ranking-btn'); // 랭킹 보기 버튼 이름 변경

const restartButton = document.getElementById('restart-button');

// 커스텀 팝업창 요소들
const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertTitle = document.getElementById('custom-alert-title');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');

// 랭킹 팝업창 요소들 추가
const rankingModalOverlay = document.getElementById('ranking-modal-overlay');
const rankingModalCloseBtn = document.getElementById('ranking-modal-close-btn');

let currentQuizIndex = 0;
let score = 0;
let timeLeft = 10;
let timerId;
let quizStartTime;
let quizEndTime;

// 커스텀 알림창을 표시하는 함수
function customAlert(title, message) {
    customAlertTitle.textContent = title;
    customAlertMessage.textContent = message;
    customAlertOverlay.style.display = 'flex'; // 오버레이 표시
}

// 커스텀 알림창 숨기는 이벤트 리스너
customAlertOkBtn.addEventListener('click', () => {
    customAlertOverlay.style.display = 'none'; // 오버레이 숨기기
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
    shuffledQuizData = tempShuffled.slice(0, 5); // 5개만 가져오기

    currentQuizIndex = 0;
    score = 0;
    quizStartTime = new Date().getTime();

    oButton.style.display = 'inline-block';
    xButton.style.display = 'inline-block';
    rankingSectionFinal.style.display = 'none';
    scoreDisplay.style.display = 'block';
    questionCounterElement.style.display = 'block';

    // 초기 랭킹 팝업은 닫아둡니다
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

        questionElement.textContent = `모든 문제를 다 풀었습니다!`;
        resultMessageElement.textContent = `최종 점수: ${score} / ${shuffledQuizData.length}점,  ${totalTimeTakenFormatted}초`;
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

// 초기 랭킹 보기 버튼 이벤트 리스너 변경 (팝업 표시)
showInitialRankingButton.addEventListener('click', () => {
    displayRanking(initialRankingList); // 랭킹 목록을 갱신하고
    rankingModalOverlay.style.display = 'flex'; // 팝업을 띄웁니다
});

// 랭킹 팝업 닫기 버튼 이벤트 리스너
rankingModalCloseBtn.addEventListener('click', () => {
    rankingModalOverlay.style.display = 'none'; // 팝업을 닫습니다
});


restartButton.addEventListener('click', () => {
    preQuizScreen.style.display = 'flex';
    quizScreen.style.display = 'none';
    employeeIdInput.value = '';
    
    // 초기 랭킹 팝업 닫아두기
    rankingModalOverlay.style.display = 'none';
    
    // 재시작 시 #quiz-screen의 배경을 기본으로 돌려놓기 (quiz-finished-bg 클래스 제거)
    quizScreen.classList.remove('quiz-finished-bg');
    
    // 최종 랭킹 화면의 z-index 초기화
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

// 초기 로드 시 화면 설정
preQuizScreen.style.display = 'flex';
quizScreen.style.display = 'none';
rankingModalOverlay.style.display = 'none'; // 랭킹 팝업 초기에는 숨김