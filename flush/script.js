// --- グローバル変数 ---
let settings = {};
let problemList = [];
let correctAnswer = '';
let currentTermIndex = 0;
let displayTimer = null;
let startTime = 0;

// --- ユーティリティ関数 ---

/**
 * 2進数文字列を生成する
 * @param {number} bits - 桁数
 * @returns {string} - ランダムな2進数文字列
 */
function generateBinaryString(bits) {
    let result = '';
    for (let i = 0; i < bits; i++) {
        result += Math.floor(Math.random() * 2); // 0か1をランダムに生成
    }
    return result;
}

/**
 * 2進数文字列のリストに対してXOR計算を行い、結果を2進数文字列で返す
 * @param {string[]} list - 2進数文字列のリスト
 * @returns {string} - XOR結果の2進数文字列
 */
function solveXOR(list) {
    if (list.length === 0) return '';
    
    // 最初の要素を整数に変換
    let result = parseInt(list[0], 2); 

    // 2番目以降の要素とXOR演算を行う
    for (let i = 1; i < list.length; i++) {
        let nextTerm = parseInt(list[i], 2);
        result = result ^ nextTerm; // JavaScriptの ^ はビットごとのXOR演算
    }

    // 結果の整数を指定桁数（settings.bits）の2進数文字列にゼロ埋めして変換
    return result.toString(2).padStart(settings.bits, '0');
}


// --- ゲーム制御関数 ---

/** ゲーム開始前のセットアップ */
function setupGame() {
    // 1. 設定値の取得
    settings.bits = parseInt(document.getElementById('bits').value);
    settings.terms = parseInt(document.getElementById('terms').value);
    settings.speed = parseFloat(document.getElementById('speed').value) * 1000; // 秒をミリ秒に変換

    // 2. 問題の生成と正解の計算
    problemList = [];
    for (let i = 0; i < settings.terms; i++) {
        problemList.push(generateBinaryString(settings.bits));
    }
    correctAnswer = solveXOR(problemList);
    
    // 3. 画面切り替え
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('play-screen').style.display = 'block';
    document.getElementById('answer-area').style.display = 'none';
    document.getElementById('display-number').textContent = '';
    document.getElementById('message').textContent = '準備中...';

    // 4. カウントダウン開始
    startCountdown(3);
}

/** カウントダウンを実行 */
function startCountdown(count) {
    if (count > 0) {
        document.getElementById('message').textContent = count;
        setTimeout(() => startCountdown(count - 1), 1000);
    } else {
        document.getElementById('message').textContent = 'スタート！';
        startTime = performance.now(); // 計測開始
        setTimeout(startDisplay, 1000); // 1秒後に表示フェーズへ
    }
}

/** 問題の表示フェーズ */
function startDisplay() {
    currentTermIndex = 0;
    document.getElementById('message').textContent = '';
    
    // 1項目の表示と次の表示のタイマー設定
    function showNextTerm() {
        if (currentTermIndex < settings.terms) {
            const num = problemList[currentTermIndex];
            document.getElementById('display-number').textContent = num;
            currentTermIndex++;
            
            // 次の表示をセット
            displayTimer = setTimeout(showNextTerm, settings.speed);
        } else {
            // 全て表示終了
            endDisplay();
        }
    }
    
    // 最初の項目の表示を開始
    showNextTerm();
}

/** 表示フェーズ終了、回答入力フェーズへ */
function endDisplay() {
    clearTimeout(displayTimer);
    document.getElementById('display-number').textContent = '';
    document.getElementById('message').textContent = '答えを入力してください！';
    document.getElementById('answer-area').style.display = 'block';
    document.getElementById('user-answer').focus(); // 入力フィールドにフォーカス
}

/** 回答のチェックと結果の表示 */
function checkAnswer() {
    const userAnswer = document.getElementById('user-answer').value.trim();
    const endTime = performance.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // ミリ秒から秒へ変換
    
    // 入力値のチェック
    if (userAnswer.length !== settings.bits || !/^[01]+$/.test(userAnswer)) {
        alert(`答えは正確に${settings.bits}桁の2進数で入力してください。`);
        return;
    }
    
    // 結果判定
    const isCorrect = userAnswer === correctAnswer;
    
    // 画面切り替え
    document.getElementById('play-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    // 結果表示
    const resultTextElement = document.getElementById('result-text');
    resultTextElement.innerHTML = isCorrect ? '🎉 **正解です！** 素晴らしい！' : '❌ **残念、不正解です。**';
    resultTextElement.style.color = isCorrect ? 'green' : 'red';

    document.getElementById('correct-answer').textContent = `正解: ${correctAnswer}`;
    document.getElementById('time-taken').textContent = `総合所要時間: ${timeTaken}秒`;
}


// --- イベントリスナーの設定 ---

document.addEventListener('DOMContentLoaded', () => {
    // スタートボタン
    document.getElementById('start-button').addEventListener('click', setupGame);

    // 回答ボタン
    document.getElementById('submit-button').addEventListener('click', checkAnswer);

    // 回答入力フィールドでEnterキーを押したときも回答をチェック
    document.getElementById('user-answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // リトライボタン
    document.getElementById('retry-button').addEventListener('click', () => {
        document.getElementById('result-screen').style.display = 'none';
        document.getElementById('user-answer').value = ''; // 入力値をリセット
        document.getElementById('settings-screen').style.display = 'block';
    });
});
