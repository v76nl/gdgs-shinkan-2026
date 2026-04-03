/**
 * 表示データの設定
 * 外部JSONとして分離可能な構造にしている。
 */
const signageData = {
    settings: {
        autoPlayInterval: 5000, // スライド切り替え間隔（ミリ秒）
        transition: "fade"      // アニメーション種類の設定
    },
    // 常時表示する要素
    globalElements: [
        {
            type: "text",
            content: "2026年度 新入生歓迎イベント",
            style: {
                top: "20px",
                left: "30px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333333",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "5px 15px",
                borderRadius: "5px"
            }
        },
        {
            type: "text",
            content: "代表: 仮名 太郎 (Taro KAMEI)",
            style: {
                bottom: "20px",
                right: "30px",
                fontSize: "16px",
                color: "#666666"
            }
        }
    ],
    // スライドごとの要素
    slides: [
        {
            id: "slide-1",
            backgroundColor: "#e3f2fd",
            elements: [
                {
                    type: "text",
                    content: "プログラミングサークルへようこそ",
                    style: {
                        top: "25%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "64px",
                        fontWeight: "bold",
                        color: "#1565c0",
                        textAlign: "center",
                        width: "90%"
                    }
                },
                {
                    type: "text",
                    content: "初心者大歓迎！",
                    style: {
                        top: "45%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "32px",
                        color: "#ef6c00"
                    }
                },
                {
                    // 画像要素の追加
                    type: "image",
                    url: "assets/sample.png", // assetsフォルダ内の画像パスを指定
                    style: {
                        top: "55%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "300px",
                        height: "200px" // 実際の画像に合わせて調整
                    }
                }
            ]
        },
        {
            id: "slide-2",
            backgroundColor: "#f1f8e9",
            elements: [
                {
                    type: "text",
                    content: "活動内容",
                    style: {
                        top: "20%",
                        left: "10%",
                        fontSize: "48px",
                        fontWeight: "bold",
                        color: "#2e7d32",
                        borderBottom: "4px solid #2e7d32",
                        paddingBottom: "10px"
                    }
                },
                {
                    type: "text",
                    content: "・Webアプリケーション開発<br>・競技プログラミング対策<br>・ハッカソンへの参加",
                    style: {
                        top: "40%",
                        left: "15%",
                        fontSize: "32px",
                        color: "#333333",
                        lineHeight: "2.0"
                    }
                }
            ]
        },
        {
            id: "slide-3",
            backgroundColor: "#fff3e0",
            elements: [
                {
                    type: "text",
                    content: "活動日時・場所",
                    style: {
                        top: "20%",
                        left: "10%",
                        fontSize: "48px",
                        fontWeight: "bold",
                        color: "#e65100",
                        borderBottom: "4px solid #e65100",
                        paddingBottom: "10px"
                    }
                },
                {
                    type: "text",
                    content: "毎週 火・木曜日 17:00〜<br>学生会館 3階 302号室",
                    style: {
                        top: "45%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "40px",
                        color: "#333333",
                        textAlign: "center",
                        lineHeight: "1.8"
                    }
                }
            ]
        }
    ]
};

// アプリケーションの状態管理
let currentSlideIndex = 0;
let slideTimer = null;
let isTransitioning = false;

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
        signageData.slides.forEach((slideData, index) => {
            const slideEl = document.createElement("div");
            slideEl.classList.add("slide");
            slideEl.id = slideData.id;
            
            if (slideData.backgroundColor) {
                slideEl.style.backgroundColor = slideData.backgroundColor;
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
    if (isTransitioning) return;
    
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
document.addEventListener("DOMContentLoaded", initSignage);
