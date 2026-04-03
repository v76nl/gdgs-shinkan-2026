// アプリケーションの状態管理
let signageData = null;
let currentSlideIndex = 0;
let slideTimer = null;
let isTransitioning = false;

/**
 * データを読み込む
 */
async function loadSignageData() {
    try {
        const response = await fetch('signage.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        signageData = await response.json();
        initSignage();
    } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
    }
}

/**
 * DOM要素を生成する関数
 * @param {Object} elementData - 要素のデータ
 * @returns {HTMLElement} 生成されたDOM要素
 */
function createElementNode(elementData) {
    const el = document.createElement("div");
    el.classList.add("element");

    // スタイルの適用
    if (elementData.style) {
        for (const [key, value] of Object.entries(elementData.style)) {
            el.style[key] = value;
        }
    }

    // コンテンツの挿入
    if (elementData.type === "text") {
        el.innerHTML = elementData.content;
    } else if (elementData.type === "image") {
        const img = document.createElement("img");
        img.src = elementData.url;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        el.appendChild(img);
    }

    return el;
}

/**
 * 初期化処理
 */
function initSignage() {
    if (!signageData) return;

    // トランジション設定の反映
    const appEl = document.getElementById("app");
    if (appEl) {
        appEl.setAttribute("data-transition", signageData.settings.transition);
    }

    // 常時表示要素の描画
    const globalLayer = document.getElementById("global-layer");
    if (globalLayer) {
        signageData.globalElements.forEach(item => {
            globalLayer.appendChild(createElementNode(item));
        });
    }

    // スライド要素の描画
    const slideContainer = document.getElementById("slide-container");
    if (slideContainer) {
        const totalSlides = signageData.slides.length;
        signageData.slides.forEach((slideData, index) => {
            const slideEl = document.createElement("div");
            slideEl.classList.add("slide");
            slideEl.id = slideData.id;
            
            // スライドごとに均等に色相(Hue)を割り当てる
            const hue = Math.floor((index * 360) / totalSlides);
            const bgColor = `hsl(${hue}, 60%, 92%)`;      // 淡い背景色
            const primaryColor = `hsl(${hue}, 80%, 35%)`; // 文字・ボーダーのメイン色
            const secondaryColor = `hsl(${(hue + 45) % 360}, 80%, 45%)`; // アクセントカラー

            // CSS変数として注入
            slideEl.style.setProperty('--slide-bg', bgColor);
            slideEl.style.setProperty('--slide-primary', primaryColor);
            slideEl.style.setProperty('--slide-secondary', secondaryColor);
            
            if (slideData.backgroundColor) {
                slideEl.style.backgroundColor = slideData.backgroundColor;
            } else {
                slideEl.style.backgroundColor = 'var(--slide-bg)'; // 指定がなければ動的に決定した淡い色
            }

            slideData.elements.forEach(item => {
                slideEl.appendChild(createElementNode(item));
            });

            // 最初のスライドをアクティブにする
            if (index === 0) {
                slideEl.classList.add("active");
            }

            slideContainer.appendChild(slideEl);
        });
    }

    // 自動再生の開始
    startTimer();

    // キーボード操作の登録
    setupKeyboardNavigation();
}

/**
 * スライドを切り替える関数
 * @param {number} nextIndex - 表示するスライドのインデックス
 */
function changeSlide(nextIndex) {
    if (isTransitioning || !signageData) return;
    
    const slides = document.querySelectorAll(".slide");
    if (slides.length <= 1) return;

    // インデックスのループ処理
    if (nextIndex >= slides.length) {
        nextIndex = 0;
    } else if (nextIndex < 0) {
        nextIndex = slides.length - 1;
    }

    if (currentSlideIndex === nextIndex) return;

    isTransitioning = true;
    
    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[nextIndex];

    // 状態の更新
    currentSlide.classList.remove("active");
    nextSlide.classList.add("active");

    currentSlideIndex = nextIndex;

    // トランジション完了後にフラグを戻す
    // CSSのtransition-durationより少し長めに設定する
    setTimeout(() => {
        isTransitioning = false;
    }, 850); 
}

/**
 * 次のスライドへ進む
 */
function nextSlide() {
    changeSlide(currentSlideIndex + 1);
}

/**
 * 前のスライドへ戻る
 */
function prevSlide() {
    changeSlide(currentSlideIndex - 1);
}

/**
 * 自動再生タイマーを開始する
 */
function startTimer() {
    if (!signageData) return;
    stopTimer();
    slideTimer = setInterval(nextSlide, signageData.settings.autoPlayInterval);
}

/**
 * 自動再生タイマーを停止する
 */
function stopTimer() {
    if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
    }
}

/**
 * キーボードイベントの登録
 */
function setupKeyboardNavigation() {
    window.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            stopTimer();
            nextSlide();
            startTimer(); // 手動操作後にタイマーをリセット
        } else if (event.key === "ArrowLeft") {
            stopTimer();
            prevSlide();
            startTimer();
        }
    });
}

// 実行
document.addEventListener("DOMContentLoaded", loadSignageData);
