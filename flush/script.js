// --- グローバル変数 (変更なし) ---
let settings = {};
let problemList = [];
let correctAnswer = '';
let currentTermIndex = 0;
let displayTimer = null;
let startTime = 0;

// --- 定数（新しく追加/変更） ---
// 数字が表示される時間を設定値から計算するための定数
const BLANK_DURATION_MS = 50; // 数字が消えている時間（ブランク時間）を50ミリ秒に設定

// ... (utility functions - generateBinaryString, solveXOR は変更なし) ...

// --- ゲーム制御関数 (setupGame, startCountdown は変更なし) ---
// ...

/** 問題の表示フェーズ (修正) */
function startDisplay() {
    currentTermIndex = 0;
    document.getElementById('message').textContent = '';
    
    // 1項目の表示時間からブランク時間を引いたものが、実際の数字表示時間になる
    const actualDisplayTime = settings.speed - BLANK_DURATION_MS;

    // 表示時間がブランク時間よりも短い場合は警告または調整
    if (actualDisplayTime <= 0) {
        console.error("表示時間が短すぎます。スピード設定を上げてください。");
        // 最低限の表示時間を確保 (例: 10ms)
        const displayTime = Math.max(10, settings.speed / 2); 
        const blankTime = settings.speed - displayTime;
        return; 
    }
    
    // 1項目の表示 -> ブランク -> 次の表示 のサイクル
    function showNextTerm() {
        if (currentTermIndex < settings.terms) {
            const num = problemList[currentTermIndex];
            
            // 1. 数字を表示
            document.getElementById('display-number').textContent = num;
            
            // 2. 表示時間だけ待機
            setTimeout(() => {
                
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
            // ここには到達しないはずだが念のため
            endDisplay();
        }
    }
    
    // 最初の項目の表示を開始
    showNextTerm();
}

// ... (endDisplay, checkAnswer, イベントリスナーは変更なし) ...
