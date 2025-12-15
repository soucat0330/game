// --- グローバル変数 ---
let settings = {};
let problemList = [];
let correctAnswer = '';
let currentTermIndex = 0;
let displayTimer = null;
let startTime = 0;

// --- 定数（ブランク時間の設定） ---
// 数字が画面から消えている時間（ブランク時間）を50ミリ秒に設定
const BLANK_DURATION_MS = 50; 

// --- ユーティリティ関数 ---

/**
 * 2進数文字列を生成する
 * @param {number} bits - 桁数
 * @returns {string} - ランダムな2進数文字列
 */
function generateBinaryString(bits) {
    let result = '';
    for (let i = 0; i < bits; i++) {
        // 0か1をランダムに生成
        result += Math.floor(Math.random() * 2); 
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
        // JavaScriptの ^ はビットごとのXOR演算
        result = result ^ nextTerm; 
    }

    // 結果の整数を指定桁数（settings.bits）の2進数文字列にゼロ埋めして変換
    return result.toString(2).padStart(settings.bits, '0');
}


// --- ゲーム制御関数 ---

/** ゲーム開始前のセットアップ */
function setupGame() {
    // 既存のタイマーをリセット (念のためのエラー回避)
    if (displayTimer) {
        clearTimeout(displayTimer);
        displayTimer = null;
    }

    // 1. 設定値の取得
    settings.bits = parseInt(document.getElementById('bits').value);
    settings.terms = parseInt(document.getElementById('terms').value);
    // 秒をミリ秒に変換
    settings.speed = parseFloat(document.getElementById('speed').value) * 1000; 

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
        // 総合時間の計測開始
        startTime = performance.now(); 
        setTimeout(startDisplay, 1000); // 1秒後に表示フェーズへ
    }
}

/** 問題の表示フェーズ (修正済み) */
function startDisplay() {
    currentTermIndex = 0;
    document.getElementById('message').textContent = '';
    
    // 1項目の表示時間からブランク時間を引いたものが、実際に数字が表示される時間
    let actualDisplayTime = settings.speed - BLANK_DURATION_MS;

    // 表示時間が短すぎる場合の安全策
    if (actualDisplayTime <= 0) {
        // 設定スピードの80%を表示時間、20%をブランク時間とする（最低限の動作保証）
        actualDisplayTime = settings.speed * 0.8;
        const currentBlankTime = settings.speed - actualDisplayTime;
        console.warn(`表示時間(${settings.speed}ms)が短すぎます。表示時間を${actualDisplayTime.toFixed(0)}ms、ブランク時間を${currentBlankTime.toFixed(0)}msに調整しました。`);
    }

    // 1項目の表示 -> ブランク -> 次の表示 のサイクル
    function showNextTerm() {
        // 既存のタイマーをクリア (念のため)
        clearTimeout(displayTimer);

        if (currentTermIndex < settings.terms) {
            const num = problemList[currentTermIndex];
            
            // 1. 数字を表示
            document.getElementById('display-number').textContent = num;
            
            // 2. 表示時間だけ待機
            displayTimer = setTimeout(() => {
                
                // 3. 数字を消す (ブランク)
                document.getElementById('display-number').textContent = '';
                currentTermIndex++;

                // 4. ブランク時間だけ待機し、次の数字を表示
                if (currentTermIndex < settings.terms) {
                    displayTimer = setTimeout(showNextTerm, BLANK_DURATION_MS);
                } else {
                    // 全て表示終了
                    displayTimer = setTimeout(endDisplay, BLANK_DURATION_MS);
                }

            }, actualDisplayTime); // 数字を表示する時間

        } else {
            // 全ての項目の処理が完了したらendDisplayを呼び出す
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
    // 総合所要時間を計算 (ミリ秒から秒へ変換)
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); 
    
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
