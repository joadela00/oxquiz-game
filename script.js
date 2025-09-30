
대화
J
joadela
5:33 PM
?
I
iPad
5:49 PM
// ====== 이 5가지 변수 값만 새눤님의 Sheets 정보에 맞게 정확히 수정해 주세요! ======
const SPREADSHEET_ID = '여기에_새눤님_Google_Sheets_ID를_붙여넣으세요'; 
const QUIZ_RESULT_SHEET_NAME = '시트1'; // 퀴즈 결과가 저장되는 시트 이름 (예: '시트1', 'Sheet1', '퀴즈 결과')
const AFFILIATION_SHEET_NAME = '소속 정보'; // 새로 만든 '소속 정보' 시트 이름!
// --- 아래는 Google Sheets 첫 번째 행(헤더)에 있는 실제 컬럼명과 일치해야 합니다. ---
const EMPLOYEE_ID_COL_NAME = '사번';
const SCORE_COL_NAME = '점수';
const TIME_COL_NAME = '소요 시간 (밀리초)';
const AFFILIATION_COL_NAME = '소속'; // '소속 정보' 시트의 소속 컬럼 이름!
// ==============================================================================


function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. 소속 정보 시트에서 데이터 가져오기 (사번 -> 소속 맵 생성)
    const affiliationSheet = spreadsheet.getSheetByName(AFFILIATION_SHEET_NAME);
    const affiliationMap = {}; 

    if (affiliationSheet) {
      const affRange = affiliationSheet.getDataRange();
      const affValues = affRange.getValues();
      if (affValues.length > 1) { // 헤더(첫 행) 제외
        const affHeaders = affValues[0];
        const affIdColIndex = affHeaders.indexOf(EMPLOYEE_ID_COL_NAME);
        const affNameColIndex = affHeaders.indexOf(AFFILIATION_COL_NAME);
        
        for (let i = 1; i < affValues.length; i++) {
          const empId = String(affValues[i][affIdColIndex]).trim();
          const affName = String(affValues[i][affNameColIndex]).trim();
          if (empId) { 
            affiliationMap[empId] = affName;
          }
        }
      }
    }
    
    // 2. 퀴즈 결과 시트에서 데이터 가져오기 및 처리
    const quizResultSheet = spreadsheet.getSheetByName(QUIZ_RESULT_SHEET_NAME);
    
    if (!quizResultSheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: `Quiz result sheet not found: ${QUIZ_RESULT_SHEET_NAME}` }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const quizRange = quizResultSheet.getDataRange();
    const quizValues = quizRange.getValues();

    if (quizValues.length < 1) {
      return ContentService.createTextOutput(JSON.stringify({ error: "No quiz data found in the sheet." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = quizValues[0]; // 퀴즈 결과 시트의 헤더
    const data = quizValues.slice(1); // 퀴즈 결과 데이터 (헤더 제외)

    const parsedData = data.map(row => {
      const employeeIdCol = headers.indexOf(EMPLOYEE_ID_COL_NAME);
      const scoreCol = headers.indexOf(SCORE_COL_NAME);
      const timeCol = headers.indexOf(TIME_COL_NAME);

      const employeeId = row[employeeIdCol] ? String(row[employeeIdCol]).trim() : 'Unknown';
      const score = row[scoreCol] ? parseInt(row[scoreCol], 10) : 0;
      const timeTakenMillis = row[timeCol] ? parseInt(row[timeCol], 10) : 999999999;
      
      // 소속 정보 추가!
      const affiliation = affiliationMap[employeeId] || '소속 없음'; 
      
      return { employeeId, affiliation, score, timeTakenMillis };
    });
    
    // 사번별 최고 기록만 남기기
    const uniqueRankings = {};
    parsedData.forEach(entry => {
      if (!uniqueRankings[entry.employeeId] || 
          (entry.score > uniqueRankings[entry.employeeId].score) ||
          (entry.score === uniqueRankings[entry.employeeId].score && entry.timeTakenMillis < uniqueRankings[entry.employeeId].timeTakenMillis)) {
        uniqueRankings[entry.employeeId] = entry;
      }
    });

    // 랭킹 정렬 (점수 내림차순, 시간이 같으면 시간 오름차순)
    const sortedRankings = Object.values(uniqueRankings).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; 
      }
      return a.timeTakenMillis - b.timeTakenMillis;
    });
    
    // 최종 랭킹 데이터를 JSON 형태로 반환
    return ContentService.createTextOutput(JSON.stringify(sortedRankings))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`Error in doGet: ${error.message}`);
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
J
joadela
5:56 PM
https://script.google.com/macros/s/AKfycbzcGK20W23H9hxaJXLyC19N31X9cdvyLCi2PZ5B215MPJlcyh0yXdNeuUOuTUnUZmMo4w/exec
I
iPad
5:57 PM
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
        question: "전화를 망치면 행지팀엔 비밀로 한다",
        answer: false
    },
    {
        question: "점심시간에는 모니터링을 하지 않는다",
        answer: true
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

// ---------- 중요: Google Apps Script 웹 앱 URL을 여기에 붙여넣으세요! ----------
// 이 부분은 새눤님께서 이전 에러 수정하실 때 올바른 URL로 이미 대체하셨습니다.
const APPS_SCRIPT_RANKING_API_URL = 'https://script.google.com/macros/s/AKfycbx5qF3QLHRC4dxh5az4tBtWlwGb60qCr76fBkSDIA6205s37yQY2N17ikcC0Ey1WcWuUA/exec'; 
// ----------------------------------------------------------------------------------

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

    // --- 사번 유효성 검사 로직 ---
    const sixDigitsPattern = /^\d{6}$/;
    const letterAndFiveDigitsPattern = /^[a-zA-Z]\d{5}$/;

    if (!(sixDigitsPattern.test(currentPlayerId) || letterAndFiveDigitsPattern.test(currentPlayerId))) {
        customAlert('사번 오류', '올바른 사번을 넣어주세요');
        return;
    }
    // --- 여기까지 사번 유효성 검사 로직 ---

    preQuizScreen.style.display = 'none';
    quizScreen.style.display = 'flex';

    const tempShuffled = shuffleArray([...originalQuizData]);
    shuffledQuizData = tempShuffled.slice(0, 5); // 항상 5문제로 고정

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
                resultMessageElement.textContent = '시간 초과!';
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

        questionElement.textContent = ''; 
        questionElement.style.height = '0';
        questionElement.style.overflow = 'hidden';

        resultMessageElement.textContent = `최종 점수: ${score} / 점, ${totalTimeTakenFormatted}초`;
        resultMessageElement.style.color = '#333';

        oButton.style.display = 'none';
        xButton.style.display = 'none';
        timerElement.style.display = 'none';
        scoreDisplay.style.display = 'none';
        questionCounterElement.style.display = 'none';
        
        quizScreen.classList.add('quiz-finished-bg');

        // Google Forms로 데이터 전송 (기존 방식 유지)
        const googleFormBaseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdnP979PWZO0YLJBS9QXwbjdPL6efLNCZjFLVvepVS3cd8GIA/formResponse';
        const entryIdEmployeeId = 'entry.886611971';     // 새눤님의 사번 entry ID
        const entryIdScore = 'entry.1024204280';               // 새눤님의 점수 entry ID
        const entryIdTime = 'entry.1174827518';                 // 새눤님의 소요 시간 entry ID

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
            // 폼 전송 후 바로 랭킹을 로드하여 업데이트된 내용이 보이도록 함.
            fetchAndDisplayRankings(); 
        })
        .catch(error => {
            console.error('Google Forms 데이터 전송 실패:', error);
            fetchAndDisplayRankings(); // 에러 나더라도 랭킹은 표시
        });

        rankingSectionFinal.style.position = 'relative';
        rankingSectionFinal.style.zIndex = '3';
        rankingSectionFinal.style.display = 'block';
    }
}

// -------------------------------------------------------------------------
// 변경된 랭킹 데이터를 가져와서 표시하는 함수 (LocalStorage 제거)
async function fetchAndDisplayRankings() {
    try {
        const response = await fetch(APPS_SCRIPT_RANKING_API_URL);
        if (!response.ok) {
            // HTTP 오류 시 응답 본문 파싱 시도 (Apps Script에서 에러 JSON을 보낼 수 있음)
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }
        const rankings = await response.json();
        
        if (rankings.error) {
            console.error("Apps Script Error:", rankings.error);
            displayRankingsToDOM([], finalRankingList, true); // 에러 발생 시 빈 랭킹 리스트 표시
            displayRankingsToDOM([], initialRankingList, true); // 팝업 랭킹도
            return;
        }

        displayRankingsToDOM(rankings, finalRankingList);
        displayRankingsToDOM(rankings, initialRankingList);

    } catch (error) {
        console.error('랭킹 데이터를 가져오는데 실패했습니다:', error);
        displayRankingsToDOM([], finalRankingList, true); // 에러 발생 시 빈 랭킹 리스트 표시
        displayRankingsToDOM([], initialRankingList, true); // 팝업 랭킹도
    }
}

// DOM에 랭킹을 실제로 표시하는 유틸리티 함수
// 이 함수가 소속 정보를 표시하도록 변경되었습니다!
function displayRankingsToDOM(rankings, targetListElement, showError = false) {
    targetListElement.innerHTML = ''; // 기존 내용 지우기

    if (showError) {
        targetListElement.innerHTML = '<li>랭킹을 불러오는데 실패했습니다.</li>';
        return;
    }

    if (rankings.length === 0) {
        targetListElement.innerHTML = '<li>첫 기록을 남겨보세요!</li>';
        return;
    }

    const limitedRankings = rankings.slice(0, 10); // 최대 10개만 표시

    limitedRankings.forEach((entry, index) => {
        const timeTakenFormatted = (entry.timeTakenMillis / 1000).toFixed(2);
        const listItem = document.createElement('li');
        // 여기! player-info span 태그 안에 affiliation(소속)과 employeeId(사번)을 함께 표시합니다.
        listItem.innerHTML = `
            <span class="rank-number">${index + 1}위</span>
            <span class="player-info">${entry.affiliation} | ${entry.employeeId}</span>
            <span class="score-time">${entry.score}점 / ${timeTakenFormatted}초</span>
        `;
        targetListElement.appendChild(listItem);
    });
}
// -------------------------------------------------------------------------

startQuizButton.addEventListener('click', startQuizProcess);
oButton.addEventListener('click', () => checkAnswer(true));
xButton.addEventListener('click', () => checkAnswer(false));

showInitialRankingButton.addEventListener('click', () => {
    fetchAndDisplayRankings(); // 팝업창 열 때 랭킹 데이터를 새로 가져옵니다.
    rankingModalOverlay.style.display = 'flex';
});

rankingModalCloseBtn.addEventListener('click', () => {
    rankingModalOverlay.style.display = 'none';
});

restartButton.addEventListener('click', () => {
    preQuizScreen.style.display = 'flex';
    quizScreen.style.display = 'none';
    employeeIdInput.value = '';
    
    questionElement.style.height = ''; 
    questionElement.style.overflow = ''; 
    questionElement.textContent = ''; 

    rankingModalOverlay.style.display = 'none';
    quizScreen.classList.remove('quiz-finished-bg');
    rankingSectionFinal.style.position = '';
    rankingSectionFinal.style.zIndex = '';
    rankingSectionFinal.style.display = 'none'; // 최종 랭킹 화면 숨기기

    fetchAndDisplayRankings(); // 초기 화면 복귀 시에도 랭킹 업데이트
});

function checkAnswer(userAnswer) {
    clearInterval(timerId);
    oButton.disabled = true;
    xButton.disabled = true;

    const currentQuiz = shuffledQuizData[currentQuizIndex];
    if (userAnswer === currentQuiz.answer) {
        resultMessageElement.textContent = '정답입니다!';
        resultMessageElement.style.color = '#27ae60';
        score++;
    } else {
        resultMessageElement.textContent = '오답입니다.';
        resultMessageElement.style.color = '#e74c3c';
    }
    scoreDisplay.textContent = `점수: ${score}`;

    setTimeout(() => {
        currentQuizIndex++;
        loadQuiz();
    }, 2000);
}

// 웹사이트 로드 시 초기 랭킹을 가져와 표시합니다.
preQuizScreen.style.display = 'flex';
quizScreen.style.display = 'none';
rankingModalOverlay.style.display = 'none';
fetchAndDisplayRankings(); // 초기 화면 로드 시에도 랭킹 표시
