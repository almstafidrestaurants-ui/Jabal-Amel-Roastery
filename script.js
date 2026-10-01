"use strict";
/* =========================================================
   01 - GLOBAL STATE
========================================================= */
const AppState = {
    loadingProgress: 0,
    loadingTimer: null,
    currentProduct: null,
    selectedWeight: null,
    selectedGrind: null,
    quantity: 1,
    cart: [],
    searchText: "",
    currentCategory: "all"
};

/* =========================================================
   02 - DOM READY
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

/* =========================================================
   03 - INITIALIZE APP
========================================================= */
function initializeApp() {
    cacheElements();
    /* تبدأ كل زيارة للمنيو بسلة فارغة */
    AppState.cart = [];
    saveCart();
    setupSplashScreen();
    setupProductCards();
    setupCategories();
    setupSearch();
    setupModal();
    setupQuantityControls();
    setupNavigation();
    setupLocationButtons();
    updateCartCount();
}

function setupLocationButtons() {
    const allowLocationBtn =
        document.getElementById("allowLocationBtn");
    if (allowLocationBtn) {
        allowLocationBtn.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                requestCustomerLocation();
            }
        );
    }

    const cancelLocationBtn =
        document.getElementById("cancelLocationBtn");

    if (cancelLocationBtn) {

        cancelLocationBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                closeLocationModal();

            }
        );

    }

}
/* =========================================================
   04 - DOM ELEMENTS
========================================================= */

const Elements = {

    splash: null,

    mainMenu: null,

    loadingPercent: null,

    loadingText: null,

    searchInput: null,

    productsList: null,

    categoryCards: null,

    productModal: null,

    modalOverlay: null,

    modalClose: null,

    modalImage: null,

    modalTitle: null,

    modalDescription: null,

    weightOptions: null,

    grindOptions: null,

    quantityValue: null,

    addToCartButton: null,

    cartCount: null,

    bottomNavigation: null

};


function cacheElements() {

    Elements.splash =
        document.querySelector(".splash-screen");

    Elements.mainMenu =
        document.querySelector(".main-menu");

    Elements.loadingPercent =
        document.querySelector(".loading-percent");

    Elements.loadingText =
        document.querySelector(".loading-text");

    Elements.searchInput =
        document.querySelector(
            ".search-box input"
        );

    Elements.productsList =
        document.querySelector(".products-list");

    Elements.categoryCards =
        document.querySelectorAll(".category-card");

    Elements.productModal =
        document.querySelector(".product-modal");

    Elements.modalOverlay =
        document.querySelector(
            ".product-modal-overlay"
        );

    Elements.modalClose =
        document.querySelector(".modal-close");

    Elements.modalImage =
        document.querySelector(
            ".modal-product-image img"
        );

    Elements.modalTitle =
        document.querySelector(
            ".modal-product-info > h2"
        );

    Elements.modalDescription =
        document.querySelector(
            ".modal-product-info > p"
        );

    Elements.weightOptions =
        document.querySelector(".weight-options");

    Elements.grindOptions =
        document.querySelector(".grind-options");

    Elements.quantityValue =
        document.querySelector(
            ".quantity-control span"
        );

   Elements.addToCartButton =
    document.getElementById(
        "optionsAddCart"
    );

    Elements.cartCount =
        document.querySelector(".cart-count");

    Elements.bottomNavigation =
        document.querySelector(
            ".bottom-navigation"
        );

}
/* =========================================================
   05 - SPLASH SCREEN
   0% → 100% خلال 3 ثواني
========================================================= */

function setupSplashScreen() {

    if (!Elements.splash) {
        return;
    }

    Elements.splash.style.display = "block";
    Elements.splash.style.opacity = "1";

    if (Elements.mainMenu) {
        Elements.mainMenu.style.display = "none";
        Elements.mainMenu.style.opacity = "0";
    }

    AppState.loadingProgress = 0;

    updateLoadingProgress();

    const duration = 3000;
    const startTime = performance.now();

    function loadingAnimation(currentTime) {

        const elapsed = currentTime - startTime;

        AppState.loadingProgress =
            Math.min(
                (elapsed / duration) * 100,
                100
            );

        updateLoadingProgress();

        if (AppState.loadingProgress < 100) {

            requestAnimationFrame(
                loadingAnimation
            );

        } else {

            AppState.loadingProgress = 100;

            updateLoadingProgress();

            finishSplashScreen();
        }
    }

    requestAnimationFrame(
        loadingAnimation
    );
}


/* =========================================================
   06 - UPDATE LOADING
========================================================= */

function updateLoadingProgress() {

    const percent = Math.floor(
        AppState.loadingProgress
    );

    if (Elements.loadingPercent) {

        Elements.loadingPercent.textContent =
            percent + "%";
    }

    if (Elements.loadingText) {

        if (percent < 100) {

            Elements.loadingText.textContent =
                "جاري تحميل المنيو...";

        } else {

            Elements.loadingText.textContent =
                "أهلاً وسهلاً بكم";
        }
    }
}


/* =========================================================
   07 - FINISH SPLASH
========================================================= */

function finishSplashScreen() {

    if (!Elements.splash) {
        showMainMenu();
        return;
    }

    // وصل 100% ثم اختفاء سريع
    Elements.splash.style.transition =
        "opacity 0.15s ease";

    Elements.splash.style.opacity = "0";

    setTimeout(function () {

        Elements.splash.style.display =
            "none";

        showMainMenu();

    }, 150);
}


/* =========================================================
   08 - SHOW MAIN MENU
========================================================= */

function showMainMenu() {

    if (!Elements.mainMenu) {
        return;
    }

    Elements.mainMenu.style.display =
        "block";

    Elements.mainMenu.style.opacity =
        "1";
}
/* =========================================================
   10 - PRODUCT CARDS
========================================================= */
function setupProductCards() {

    const products =
        document.querySelectorAll(
            ".category-product-card"
        );

    products.forEach(card => {

        card.addEventListener(
            "click",
            function (event) {

                const addButton =
                    event.target.closest(
                        ".category-product-add"
                    );

            if (addButton) {

    event.preventDefault();
    event.stopPropagation();

    openProductOptionsFixed(
        addButton
    );

    return;
}

            }
        );

    });

}
/* =========================================================
   11 - OPEN PRODUCT
========================================================= */

function openProductModal(card) {

    if (!card || !Elements.productModal) {
        return;
    }

    const image =
        card.querySelector(
            ".product-image"
        );

    const name =
        card.querySelector(
            ".product-name"
        );

    const description =
        card.querySelector(
            ".product-description"
        );

    const price =
        card.querySelector(
            ".product-price strong"
        );

    const product = {

        id:
            card.dataset.id ||
            createProductId(
                name
                    ? name.textContent
                    : "product"
            ),

        name:
            name
                ? name.textContent.trim()
                : "منتج",

        description:
            description
                ? description.textContent.trim()
                : "",

        image:
            image
                ? image.getAttribute("src")
                : "",

        price:
            price
                ? parsePrice(
                    price.textContent
                )
                : 0,

        card: card

    };


    AppState.currentProduct = product;

    AppState.quantity = 1;

    AppState.selectedWeight =
        getDefaultWeight(card);

    AppState.selectedGrind =
        getDefaultGrind(card);


    fillModal(product);

    resetModalOptions();

    updateModalPrice();

    Elements.productModal.classList.add(
        "active"
    );

    document.body.style.overflow = "hidden";

}


/* =========================================================
   12 - FILL MODAL
========================================================= */

function fillModal(product) {

    if (Elements.modalImage) {

        Elements.modalImage.src =
            product.image;

        Elements.modalImage.alt =
            product.name;

    }

    if (Elements.modalTitle) {

        Elements.modalTitle.textContent =
            product.name;

    }

    if (Elements.modalDescription) {

        Elements.modalDescription.textContent =
            product.description;

    }

}


/* =========================================================
   13 - DEFAULT WEIGHT
========================================================= */
function getDefaultWeight(card) {
    return "1000 g";
}

/* =========================================================
   14 - DEFAULT GRIND
========================================================= */

function getDefaultGrind(card) {

    const active =
        card.querySelector(
            ".grind-option.active"
        );

    if (active) {

        return active.dataset.grind ||
            active.textContent.trim();

    }

    return "Whole";

}


/* =========================================================
   15 - RESET MODAL OPTIONS
========================================================= */

function resetModalOptions() {

    if (Elements.quantityValue) {

        Elements.quantityValue.textContent =
            "1";

    }
if (Elements.weightOptions) {

    const options =
        Elements.weightOptions.querySelectorAll(
            ".weight-option"
        );

    options.forEach(option => {
        option.classList.remove("active");
    });

    const defaultWeight =
        Array.from(options).find(option => {

            const value =
                option.dataset.weight ||
                option.textContent.trim();

            return normalizeText(value) === "1000 g";

        });

    if (defaultWeight) {

        defaultWeight.classList.add("active");

        AppState.selectedWeight = "1000 g";
    }
}
    if (Elements.grindOptions) {

        const options =
            Elements.grindOptions.querySelectorAll(
                ".grind-option"
            );

        options.forEach(option => {

            option.classList.remove("active");

            const value =
                option.dataset.grind ||
                option.textContent.trim();

            if (
                normalizeText(value) ===
                normalizeText(
                    AppState.selectedGrind
                )
            ) {

                option.classList.add("active");

            }

        });

    }

}


/* =========================================================
   16 - WEIGHT SELECTION
========================================================= */

function setupWeightOptions() {

    if (!Elements.weightOptions) {
        return;
    }

    const options =
        Elements.weightOptions.querySelectorAll(
            ".weight-option"
        );

    options.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                options.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

                option.classList.add("active");

                AppState.selectedWeight =
                    option.dataset.weight ||
                    option.textContent.trim();

                updateModalPrice();

            }
        );

    });

}

setupWeightOptions();


/* =========================================================
   17 - GRIND SELECTION
========================================================= */

function setupGrindOptions() {

    if (!Elements.grindOptions) {
        return;
    }

    const options =
        Elements.grindOptions.querySelectorAll(
            ".grind-option"
        );

    options.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                options.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

                option.classList.add("active");

                AppState.selectedGrind =
                    option.dataset.grind ||
                    option.textContent.trim();

            }
        );

    });

}

setupGrindOptions();


/* =========================================================
   18 - QUANTITY CONTROLS
========================================================= */

function setupQuantityControls() {

    const control =
        document.querySelector(
            ".quantity-control"
        );

    if (!control) {
        return;
    }

    const buttons =
        control.querySelectorAll("button");

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const type =
                    button.dataset.action;

                if (
                    type === "increase" ||
                    button.textContent.trim() === "+"
                ) {

                    increaseQuantity();

                } else {

                    decreaseQuantity();

                }

            }
        );

    });

}


/* =========================================================
   19 - INCREASE QUANTITY
========================================================= */

function increaseQuantity() {

    AppState.quantity++;

    if (AppState.quantity > 99) {

        AppState.quantity = 99;

    }

    updateQuantityDisplay();

    updateModalPrice();

}


/* =========================================================
   20 - DECREASE QUANTITY
========================================================= */

function decreaseQuantity() {

    AppState.quantity--;

    if (AppState.quantity < 1) {

        AppState.quantity = 1;

    }

    updateQuantityDisplay();

    updateModalPrice();

}


/* =========================================================
   21 - QUANTITY DISPLAY
========================================================= */

function updateQuantityDisplay() {

    if (!Elements.quantityValue) {
        return;
    }

    Elements.quantityValue.textContent =
        AppState.quantity;

}
/* =========================================================
   حسابات
========================================================= */
function calculateMoney(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.round((number + Number.EPSILON) * 1000) / 1000;
}
/* =========================================================
   UPDATE WEIGHT PRICE + QUANTITY TOTAL
========================================================= */
function updateModalPrice() {

    if (!AppState.currentProduct) {
        return;
    }

    const basePrice = calculateMoney(
        AppState.currentProduct.price
    );

    const selected = document.querySelector(
        ".weight-option.active"
    );

    let unitPrice = basePrice;

    if (selected) {

        // سعر محدد مباشرة
        if (selected.dataset.price) {

            unitPrice = calculateMoney(
                parsePrice(selected.dataset.price)
            );
        }

        // وزن عادي بواسطة multiplier
        else if (selected.dataset.multiplier) {

            unitPrice = calculateMoney(
                basePrice *
                Number(selected.dataset.multiplier)
            );
        }

        // باكيت مثل 50g × 12
        else if (selected.dataset.package) {

            const packageText =
                selected.dataset.package;

            const match =
                packageText.match(/^(\d+)x(\d+)$/i);

            if (match) {

                const pieces =
                    Number(match[1]);

                const gramsPerPiece =
                    Number(match[2]);

                const totalGrams =
                    pieces * gramsPerPiece;

                const multiplier =
                    totalGrams / 1000;

                unitPrice = calculateMoney(
                    basePrice * multiplier
                );
            }
        }
    }

    // سعر الوزن / الباكيت
    const selectedWeightPrice =
        document.getElementById(
            "selectedWeightPrice"
        );

    if (selectedWeightPrice) {

        selectedWeightPrice.textContent =
            formatPrice(unitPrice);
    }

    // السعر × الكمية
    const total = calculateMoney(
        unitPrice * AppState.quantity
    );

    updateAddToCartButton(total);
}
/* =========================================================
   23 - UPDATE ADD BUTTON
========================================================= */
function updateAddToCartButton(total) {

    const totalElement =
        document.getElementById(
            "cartTotalPrice"
        );

    if (!totalElement) {
        return;
    }

    totalElement.textContent =
        formatPrice(total).replace("$", "");
}
/* =========================================================
   24 - ADD TO CART
========================================================= */

function setupAddToCart() {

    if (!Elements.addToCartButton) {
        return;
    }

    Elements.addToCartButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            addCurrentProductToCart();

        }
    );

}

setupAddToCart();


/* =========================================================
   25 - ADD CURRENT PRODUCT
========================================================= */
function addCurrentProductToCart() {

    const product = AppState.currentProduct;

    if (!product) {
        return;
    }

    const unitPrice = calculateMoney(
        getSelectedUnitPrice()
    );

    const cartItem = {

        id: product.id,

        name: product.name,

        image: product.image,

        weight: AppState.selectedWeight,

        grind: AppState.selectedGrind,

        quantity: AppState.quantity,

        unitPrice: unitPrice,

        total: calculateMoney(
            unitPrice * AppState.quantity
        )
    };

    const existing = AppState.cart.find(item =>
        item.id === cartItem.id &&
        item.weight === cartItem.weight &&
        item.grind === cartItem.grind
    );

    if (existing) {

        existing.quantity +=
            cartItem.quantity;

        existing.unitPrice =
            calculateMoney(existing.unitPrice);

        existing.total =
            calculateMoney(
                existing.quantity *
                existing.unitPrice
            );

    } else {

        AppState.cart.push(cartItem);
    }

  saveCart();

updateCartCount();

/* إغلاق مودال خيارات المنتج */
closeProductOptionsModal();

/* رسالة نجاح */
showAddedMessage(
    product.name
);
}
/* =========================================================
   26 - GET SELECTED UNIT PRICE
========================================================= */
function getSelectedUnitPrice() {

    const selected = document.querySelector(
        ".weight-option.active"
    );

    if (!selected) {

        return AppState.currentProduct
            ? calculateMoney(
                AppState.currentProduct.price
            )
            : 0;
    }

    // سعر محدد مباشرة
    if (selected.dataset.price) {

        return calculateMoney(
            parsePrice(
                selected.dataset.price
            )
        );
    }

    // وزن عادي
    if (selected.dataset.multiplier) {

        return calculateMoney(
            AppState.currentProduct.price *
            Number(selected.dataset.multiplier)
        );
    }

    // باكيت مثل 50g × 12
    if (selected.dataset.package) {

        const packageText =
            selected.dataset.package;

        const match =
            packageText.match(/^(\d+)x(\d+)$/i);

        if (match) {

            const pieces =
                Number(match[1]);

            const gramsPerPiece =
                Number(match[2]);

            const totalGrams =
                pieces * gramsPerPiece;

            const multiplier =
                totalGrams / 1000;

            return calculateMoney(
                AppState.currentProduct.price *
                multiplier
            );
        }
    }

    return AppState.currentProduct
        ? calculateMoney(
            AppState.currentProduct.price
        )
        : 0;
}
/* =========================================================
   27 - CART STORAGE
========================================================= */

function saveCart() {

    try {

        localStorage.setItem(
            "roastery_cart",
            JSON.stringify(
                AppState.cart
            )
        );

    } catch (error) {

        console.warn(
            "Could not save cart:",
            error
        );

    }

}


/* =========================================================
   28 - LOAD CART
========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "roastery_cart"
            );

        if (!saved) {
            AppState.cart = [];
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (Array.isArray(parsed)) {

            AppState.cart =
                parsed;

        } else {

            AppState.cart = [];

        }

    } catch (error) {

        console.warn(
            "Could not load cart:",
            error
        );

        AppState.cart = [];

    }

}


/* =========================================================
   29 - CART COUNT
========================================================= */

function updateCartCount() {

    if (!Elements.cartCount) {
        return;
    }

    const count =
        AppState.cart.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    Elements.cartCount.textContent =
        count > 99
            ? "99+"
            : count;

}


/* =========================================================
   30 - MODAL SETUP
========================================================= */

function setupModal() {

    if (Elements.modalOverlay) {

        Elements.modalOverlay.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (Elements.modalClose) {

        Elements.modalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                Elements.productModal &&
                Elements.productModal.classList.contains(
                    "active"
                )
            ) {

                closeProductModal();

            }

        }
    );

}


/* =========================================================
   31 - CLOSE MODAL
========================================================= */

function closeProductModal() {

    if (!Elements.productModal) {
        return;
    }

    Elements.productModal.classList.remove(
        "active"
    );

    document.body.style.overflow = "";

}


/* =========================================================
   32 - ADDED MESSAGE
========================================================= */
function showAddedMessage(productName) {

    const oldMessage =
        document.querySelector(".cart-success-message");

    if (oldMessage) {
        oldMessage.remove();
    }

    const message =
        document.createElement("div");

    message.className =
        "cart-success-message";

    message.innerHTML = `
        <div class="success-icon">✓</div>

        <div class="success-content">
            <div class="success-title">
                تمت الإضافة بنجاح
            </div>

            <div class="success-product">
                ${escapeHTML(productName)}
            </div>
        </div>
    `;

    Object.assign(message.style, {

        position: "fixed",

        left: "50%",

        bottom: "82px",

        transform:
            "translate(-50%, 25px)",

        zIndex: "99999",

        width: "calc(100% - 32px)",

        maxWidth: "350px",

        padding: "12px 15px",

        display: "flex",

        alignItems: "center",

        gap: "11px",

        direction: "rtl",

        background:
            "linear-gradient(135deg, #351b0d, #211006)",

        border:
            "1px solid rgba(240,180,55,.55)",

        borderRadius: "16px",

        boxShadow:
            "0 10px 30px rgba(0,0,0,.55), 0 0 15px rgba(240,180,55,.12)",

        color: "#fff",

        opacity: "0",

        transition:
            "opacity .3s ease, transform .3s ease",

        boxSizing: "border-box"

    });


    document.body.appendChild(message);


    /* أيقونة النجاح */

    const icon =
        message.querySelector(".success-icon");

    Object.assign(icon.style, {

        width: "32px",

        height: "32px",

        minWidth: "32px",

        borderRadius: "50%",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background:
            "linear-gradient(135deg, #ffd76a, #e9a91f)",

        color: "#241207",

        fontSize: "20px",

        fontWeight: "900",

        boxShadow:
            "0 3px 10px rgba(0,0,0,.3)"

    });


    /* النص */

    const content =
        message.querySelector(".success-content");

    Object.assign(content.style, {

        flex: "1",

        minWidth: "0",

        textAlign: "right"

    });


    const title =
        message.querySelector(".success-title");

    Object.assign(title.style, {

        fontSize: "13px",

        fontWeight: "800",

        color: "#ffd76a",

        marginBottom: "3px"

    });


    const product =
        message.querySelector(".success-product");

    Object.assign(product.style, {

        fontSize: "11px",

        color: "#eadbc8",

        whiteSpace: "nowrap",

        overflow: "hidden",

        textOverflow: "ellipsis"

    });


    /* ظهور */

    requestAnimationFrame(() => {

        message.style.opacity = "1";

        message.style.transform =
            "translate(-50%, 0)";

    });


    /* اختفاء */

    setTimeout(() => {

        message.style.opacity = "0";

        message.style.transform =
            "translate(-50%, 15px)";

        setTimeout(() => {

            message.remove();

        }, 300);

    }, 2200);

}
/* =========================================================
   CATEGORY MODAL
========================================================= */

function setupCategories() {

    if (!Elements.categoryCards) {
        return;
    }

    const categoryModal =
        document.getElementById("categoryModal");

    const categoryModalBack =
        document.getElementById("categoryModalBack");

    const categoryModalName =
        document.getElementById("categoryModalName");

    const categoryModalProducts =
        document.getElementById("categoryModalProducts");


    if (!categoryModal) {
        return;
    }


    /* فتح مودال القسم */

    Elements.categoryCards.forEach(card => {

   card.addEventListener("click", () => {

    const category =
        card.dataset.category ||
        card.getAttribute("data-category");

    if (!category) {
        return;
    }

    // مكسرات ني لها مودال مستقل
if (
    category === "nuts-raw" ||
    category === "roasted-nuts" ||
    category === "mixed-roasted-nuts" ||
    category === "dried-fruits" ||
    category === "spices"
) {
    return;
}
            const titleElement =
                card.querySelector("h3");


            const categoryName =
                titleElement
                    ? titleElement.textContent.trim()
                    : "القهوة";


            AppState.currentCategory =
                category;


            /* عنوان القسم */

            if (categoryModalName) {

                categoryModalName.textContent =
                    categoryName;

            }


            /* فتح المودال */

            categoryModal.classList.add("active");

            categoryModal.setAttribute(
                "aria-hidden",
                "false"
            );


            /* منع Scroll الصفحة الرئيسية */

            document.body.style.overflow =
                "hidden";


            /* يبدأ المودال من الأعلى */

            if (categoryModalProducts) {

                categoryModalProducts.scrollTop = 0;

            }

        });

    });


    /* زر الرجوع */

    if (categoryModalBack) {

        categoryModalBack.addEventListener(
            "click",
            closeCategoryModal
        );

    }


    /* الضغط على الخلفية */

    const background =
        categoryModal.querySelector(
            ".category-modal-overlay"
        );


    if (background) {

        background.addEventListener(
            "click",
            closeCategoryModal
        );

    }


    /* زر ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                categoryModal.classList.contains(
                    "active"
                )
            ) {

                closeCategoryModal();

            }

        }
    );

}


/* =========================================================
   CLOSE CATEGORY MODAL
========================================================= */

function closeCategoryModal() {

    const categoryModal =
        document.getElementById(
            "categoryModal"
        );


    if (!categoryModal) {
        return;
    }


    categoryModal.classList.remove(
        "active"
    );


    categoryModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow = "";

}

/* =========================================================
   34 - FILTER PRODUCTS
========================================================= */
function setupProductCards() {

    const products =
        document.querySelectorAll(
            ".category-product-card"
        );

    products.forEach(card => {

        card.addEventListener(
            "click",
            function (event) {

                const addButton =
                    event.target.closest(
                        ".category-product-add"
                    );

                if (addButton) {

                    event.preventDefault();
                    event.stopPropagation();

                    openProductOptionsFixed(
                        addButton
                    );

                    return;
                }

            }
        );

    });

}


/* =========================================================
   35 - CATEGORY TITLE
========================================================= */

function updateCategoryTitle(
    category
) {

    const title =
        document.querySelector(
            ".products-section .section-title"
        );


    if (!title) {
        return;
    }


    if (
        category === "all" ||
        category === "*"
    ) {

        const original =
            title.dataset.original;

        if (original) {

            title.textContent =
                original;

        }

        return;

    }


    if (!title.dataset.original) {

        title.dataset.original =
            title.textContent;

    }


    const activeCard =
        Array.from(
            Elements.categoryCards || []
        ).find(card =>

            normalizeText(
                card.dataset.category
            ) === normalizeText(
                category
            )

        );


    if (activeCard) {

        const categoryTitle =
            activeCard.querySelector(
                "h3"
            );


        if (categoryTitle) {

            title.textContent =
                categoryTitle.textContent.trim();

        }

    }

}


/* =========================================================
   36 - SCROLL TO PRODUCTS
========================================================= */

function scrollToProducts() {

    const section =
        document.querySelector(
            ".products-section"
        );

    if (!section) {
        return;
    }


    const headerOffset = 10;


    const position =
        section.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;


    window.scrollTo({

        top: position,

        behavior: "smooth"

    });

}
/* =========================================================
   37 - SEARCH
========================================================= */
function setupSearch() {

    if (!Elements.searchInput) {
        return;
    }

    Elements.searchInput.addEventListener(
        "input",
        function (event) {

            const value =
                normalizeSearchText(
                    event.target.value
                );

            AppState.searchText = value;

            showSearchResults(value);

        }
    );

}

function showSearchResults(searchText) {

    let resultsBox =
        document.getElementById(
            "searchResultsBox"
        );


    /* إنشاء صندوق النتائج */

    if (!resultsBox) {

        resultsBox =
            document.createElement("div");

        resultsBox.id =
            "searchResultsBox";

        document.body.appendChild(
            resultsBox
        );
    }
const searchInput = Elements.searchInput;
const rect = searchInput.getBoundingClientRect();

resultsBox.style.position = "fixed";

resultsBox.style.top =
    rect.bottom + "px";

resultsBox.style.left =
    (rect.left - 4) + "px";

resultsBox.style.width =
    (rect.width + 8) + "px";

resultsBox.style.maxWidth =
    "none";

resultsBox.style.boxSizing =
    "border-box";

    /* البحث فارغ */

    if (!searchText) {

        resultsBox.innerHTML = "";

        resultsBox.style.display = "none";

        return;
    }


    const products =
        document.querySelectorAll(
            ".category-product-card"
        );


    let results = [];


    products.forEach(function (product) {

        const name =
            product.querySelector(
                ".category-product-info h3"
            );


        const description =
            product.querySelector(
                ".category-product-info p"
            );


        const nameText =
            normalizeSearchText(
                name
                    ? name.textContent
                    : ""
            );


        const descriptionText =
            normalizeSearchText(
                description
                    ? description.textContent
                    : ""
            );


        const searchableText =
            nameText +
            " " +
            descriptionText;


        if (
            searchableText.includes(
                searchText
            )
        ) {

            results.push(product);

        }

    });


    /* لا توجد نتائج */

    if (results.length === 0) {

        resultsBox.innerHTML = `
            <div class="search-no-results">
                🔎 لا يوجد صنف مطابق
            </div>
        `;

        resultsBox.style.display =
            "block";

        return;
    }


    /* عرض النتائج */

    resultsBox.innerHTML = "";


    results.slice(0, 8).forEach(
        function (product) {

            const name =
                product.querySelector(
                    ".category-product-info h3"
                );


            const image =
                product.querySelector(
                    ".category-product-image img"
                );


            const category =
                product.closest(
                    ".category-modal"
                );


            const nameText =
                name
                    ? name.textContent.trim()
                    : "منتج";


            const imageSrc =
                image
                    ? image.src
                    : "";


            const result =
                document.createElement(
                    "div"
                );


            result.className =
                "search-result-item";


            result.innerHTML = `

                <img
                    src="${imageSrc}"
                    alt=""
                    class="search-result-image"
                >

                <div class="search-result-info">

                    <div class="search-result-name">
                        ${nameText}
                    </div>

                    <div class="search-result-category">
                        ${getProductCategoryName(product)}
                    </div>

                </div>

            `;


            /* الضغط على النتيجة */

            result.addEventListener(
                "click",
                function () {

                    /*
                     * إغلاق نتائج البحث
                     */

                    resultsBox.style.display =
                        "none";


                    /*
                     * إفراغ مربع البحث
                     */

                    Elements.searchInput.value =
                        nameText;


                    /*
                     * فتح القسم إذا المنتج
                     * موجود داخل Modal
                     */

                    if (category) {

                        category.classList.add(
                            "active"
                        );

                        category.setAttribute(
                            "aria-hidden",
                            "false"
                        );

                        document.body.style.overflow =
                            "hidden";
                    }


                    /*
                     * فتح مودال خيارات المنتج
                     */

                    const addButton =
                        product.querySelector(
                            ".category-product-add"
                        );


                    if (addButton) {

                        openProductOptionsFixed(
                            addButton
                        );

                    }

                }
            );


            resultsBox.appendChild(
                result
            );

        }
    );


    resultsBox.style.display =
        "block";

}

function getProductCategoryName(product) {

    const modal =
        product.closest(
            ".category-modal"
        );


    if (!modal) {
        return "";
    }


    const title =
        modal.querySelector(
            ".category-modal-title"
        );


    if (title) {
        return title.textContent.trim();
    }


    return "";
}
/* =========================================================
   38 - SEARCH PRODUCTS
========================================================= */

function searchProducts(searchText) {

    searchText =
        normalizeSearchText(searchText);


    if (!searchText) {
        return;
    }


    const products =
        document.querySelectorAll(
            ".category-product-card"
        );


    let firstMatch = null;


    products.forEach(function (product) {

        const name =
            product.querySelector(
                ".category-product-info h3"
            );


        const description =
            product.querySelector(
                ".category-product-info p"
            );


        const nameText =
            normalizeSearchText(
                name ? name.textContent : ""
            );


        const descriptionText =
            normalizeSearchText(
                description
                    ? description.textContent
                    : ""
            );


        const searchableText =
            nameText +
            " " +
            descriptionText;


        if (
            searchableText.includes(
                searchText
            )
        ) {

            product.style.display =
                "flex";


            if (!firstMatch) {
                firstMatch = product;
            }

        } else {

            product.style.display =
                "none";

        }

    });


    /* لا توجد نتيجة */

    if (!firstMatch) {

        showSearchMessage(
            "لم يتم العثور على المنتج"
        );

        return;
    }


    /* العثور على المودال الموجود فيه المنتج */

    const modal =
        firstMatch.closest(
            ".category-modal"
        );


    if (!modal) {
        return;
    }


    /* فتح المودال */

    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    /* النزول إلى المنتج */

    setTimeout(function () {

        firstMatch.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 150);

}


/* =========================================================
   SEARCH TEXT
========================================================= */

function normalizeSearchText(text) {

    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ");

}


/* =========================================================
   SEARCH MESSAGE
========================================================= */

function showSearchMessage(message) {

    const old =
        document.querySelector(
            ".search-message"
        );

    if (old) {
        old.remove();
    }


    const box =
        document.createElement(
            "div"
        );


    box.className =
        "search-message";


    box.textContent =
        message;


    Object.assign(
        box.style,
        {
            position: "fixed",
            top: "85px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "99999",
            background: "#351b0d",
            color: "#ffd76a",
            border: "1px solid #c58a22",
            borderRadius: "12px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 8px 25px rgba(0,0,0,.5)",
            direction: "rtl"
        }
    );


    document.body.appendChild(box);


    setTimeout(function () {

        box.remove();

    }, 1800);

}
/* =========================================================
   39 - NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".bottom-nav-item"
        );


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(nav => {

                    nav.classList.remove(
                        "active"
                    );

                });


                item.classList.add(
                    "active"
                );


                const target =
                    item.dataset.target;


                if (!target) {
                    return;
                }


                handleNavigation(
                    target
                );

            }
        );

    });


    const cartButton =
        document.querySelector(
            ".cart-icon"
        );


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            openCart
        );

    }

}


/* =========================================================
   40 - NAVIGATION ACTION
========================================================= */

function handleNavigation(
    target
) {

    switch (
        normalizeText(target)
    ) {

        case "home":

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

            break;


        case "categories":

            const categories =
                document.querySelector(
                    ".categories-section"
                );

            if (categories) {

                categories.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

            break;


        case "favorites":

            showSimpleMessage(
                "المفضلة"
            );

            break;


        case "cart":

            openCart();

            break;

    }

}


/* =========================================================
   41 - OPEN CART
========================================================= */

function openCart() {

    if (
        typeof window.openCartScreen ===
        "function"
    ) {

        window.openCartScreen();

        return;

    }


    showCartMessage();

}


/* =========================================================
   42 - CART MESSAGE
========================================================= */

function showCartMessage() {

    const count =
        AppState.cart.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 0
                ),
            0
        );


    if (count === 0) {

        showSimpleMessage(
            "السلة فارغة"
        );

        return;

    }


    const total =
        AppState.cart.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.total || 0
                ),
            0
        );


    showSimpleMessage(
        `السلة تحتوي على ${count} منتج • ${formatPrice(total)}`
    );

}


/* =========================================================
   43 - SIMPLE MESSAGE
========================================================= */

function showSimpleMessage(
    text
) {

    const old =
        document.querySelector(
            ".simple-app-message"
        );

    if (old) {
        old.remove();
    }


    const message =
        document.createElement("div");

    message.className =
        "simple-app-message";


    message.textContent =
        text;


    Object.assign(
        message.style,
        {

            position: "fixed",

            top: "50%",

            left: "50%",

            transform:
                "translate(-50%, -50%)",

            zIndex: "10000",

            padding:
                "14px 22px",

            borderRadius:
                "13px",

            background:
                "#2a1408",

            color:
                "#f5d38e",

            fontSize:
                "14px",

            fontWeight:
                "600",

            textAlign:
                "center",

            boxShadow:
                "0 8px 30px rgba(0,0,0,.4)",

            direction:
                "rtl"

        }
    );


    document.body.appendChild(
        message
    );


    setTimeout(() => {

        message.remove();

    }, 1700);

}


/* =========================================================
   44 - PRICE PARSER
========================================================= */

function parsePrice(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return 0;

    }


    const cleaned =
        String(value)
            .replace(
                /[^0-9.,-]/g,
                ""
            )
            .replace(
                ",",
                "."
            );


    const number =
        parseFloat(cleaned);


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   45 - PRICE FORMAT
========================================================= */
function formatPrice(price) {

    const number = Number(price);

    if (!Number.isFinite(number)) {
        return "$0";
    }

    return "$" + parseFloat(number.toFixed(3));
}
/* =========================================================
   46 - WEIGHT NORMALIZATION
========================================================= */

function normalizeWeight(
    value
) {

    if (!value) {
        return "";
    }


    return String(value)
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("كيلوغرام", "kg")
        .replace("كيلو", "kg")
        .replace("غرام", "g")
        .replace("جرام", "g");

}


/* =========================================================
   47 - TEXT NORMALIZATION
========================================================= */

function normalizeText(
    value
) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   48 - CREATE PRODUCT ID
========================================================= */

function createProductId(
    name
) {

    return String(name || "product")
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9\u0600-\u06ff]+/gi,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================================================
   49 - ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   50 - BODY BACK BUTTON
========================================================= */

window.addEventListener(
    "popstate",
    () => {

        if (
            Elements.productModal &&
            Elements.productModal.classList.contains(
                "active"
            )
        ) {

            closeProductModal();

        }

    }
);


/* =========================================================
   51 - TOUCH SWIPE FOR MODAL
========================================================= */

let modalTouchStartY = 0;

let modalTouchCurrentY = 0;


document.addEventListener(
    "touchstart",
    event => {

        if (
            !Elements.productModal ||
            !Elements.productModal.classList.contains(
                "active"
            )
        ) {
            return;
        }


        modalTouchStartY =
            event.touches[0].clientY;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchmove",
    event => {

        if (
            !Elements.productModal ||
            !Elements.productModal.classList.contains(
                "active"
            )
        ) {
            return;
        }


        modalTouchCurrentY =
            event.touches[0].clientY;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    () => {

        if (
            !Elements.productModal ||
            !Elements.productModal.classList.contains(
                "active"
            )
        ) {
            return;
        }


        const difference =
            modalTouchCurrentY -
            modalTouchStartY;


        if (difference > 100) {

            closeProductModal();

        }


        modalTouchStartY = 0;

        modalTouchCurrentY = 0;

    }
);


/* =========================================================
   52 - PREVENT DOUBLE TAP ZOOM
========================================================= */

let lastTouchEnd = 0;


document.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();


        if (
            now - lastTouchEnd <= 300
        ) {

            event.preventDefault();

        }


        lastTouchEnd =
            now;

    },
    {
        passive: false
    }
);


/* =========================================================
   53 - GLOBAL ACCESS
========================================================= */

window.RoasteryMenu = {

    state:
        AppState,

    openProduct:
        openProductModal,

    closeProduct:
        closeProductModal,

    addToCart:
        addCurrentProductToCart,

    getCart:
        () => AppState.cart,

    clearCart:
        () => {

            AppState.cart = [];

            saveCart();

            updateCartCount();

        }

};


/* =========================================================
   54 - FINAL INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           هذه العناصر يتم تجهيزها بعد
           إنشاء الصفحة بالكامل.
        */

        setupWeightOptions();

        setupGrindOptions();

        setupAddToCart();

        updateCartCount();

    }
);
/* =========================================================
   PRODUCT OPTIONS FIXED
========================================================= */

function openProductOptionsFixed(button) {

    const modal =
        document.getElementById("productOptionsModal");

    if (!modal) {
        console.error("productOptionsModal not found");
        return;
    }


    const card =
        button.closest(".category-product-card");

    if (!card) {
        console.error("category-product-card not found");
        return;
    }


    /* PRODUCT NAME */

    const nameElement =
        card.querySelector(".category-product-info h3");


    /* PRODUCT IMAGE */

    const imageElement =
        card.querySelector(".category-product-image img");


    /* PRODUCT PRICE */

    const priceElement =
        card.querySelector(".category-product-info strong");


    const productName =
        nameElement
            ? nameElement.textContent.trim()
            : "Coffee";


    const productImage =
        imageElement
            ? imageElement.src
            : "";


    let priceText =
        priceElement
            ? priceElement.textContent.trim()
            : "0";


 const basePrice = calculateMoney(
    parsePrice(priceText)
);

    /* =========================================
       PUT DATA IN MODAL
    ========================================= */

    const modalImage =
        document.getElementById("optionsProductImage");

    const modalName =
        document.getElementById("optionsProductName");

    const modalPrice =
        document.getElementById("optionsProductPrice");


    if (modalImage) {
        modalImage.src = productImage;
        modalImage.alt = productName;
    }


    if (modalName) {
        modalName.textContent = productName;
    }


 modalPrice.textContent =
    formatPrice(basePrice);



    /* =========================================
       DEFAULT WEIGHT = 300 g
    ========================================= */

const weightButtons =
    modal.querySelectorAll(".weight-option");


weightButtons.forEach(function (item) {
    item.classList.remove("active");
});


const defaultWeight =
    modal.querySelector(
        '[data-weight="1000 g"]'
    );


if (defaultWeight) {

    defaultWeight.classList.add("active");

    AppState.selectedWeight =
        "1000 g";
}

    /* =========================================
       RESET QUANTITY
    ========================================= */

    const quantity =
        document.getElementById("productQuantity");


    if (quantity) {
        quantity.textContent = "1";
    }

    /* =========================================
       SAVE CURRENT PRODUCT
    ========================================= */

    window.currentOptionsProduct = {
        name: productName,
        image: productImage,
        basePrice: basePrice
    };

AppState.currentProduct = {
    name: productName,
    image: productImage,
    price: basePrice
};

AppState.quantity = 1;
AppState.selectedWeight = "1000 g";

updateModalPrice();
    /* =========================================
       SHOW MODAL
    ========================================= */

    modal.classList.add("active");

    modal.style.display = "block";

    modal.style.visibility = "visible";

    modal.style.opacity = "1";

    modal.style.pointerEvents = "auto";


    document.body.style.overflow = "hidden";


    console.log(
        "Product Options opened:",
        productName
    );
}
/* =========================================================
   RAW NUTS MODAL
========================================================= */

const rawNutsModal =
    document.getElementById("rawNutsModal");

const rawNutsModalBack =
    document.getElementById("rawNutsModalBack");

const rawNutsButton =
    document.querySelector(
        '.category-card[data-category="nuts-raw"]'
    );


/* فتح مودال المكسرات الني */

if (rawNutsButton && rawNutsModal) {

    rawNutsButton.addEventListener(
        "click",
        function () {

            rawNutsModal.classList.add("active");

            document.body.style.overflow =
                "hidden";

        }
    );

}


/* إغلاق المودال */

if (rawNutsModalBack && rawNutsModal) {

    rawNutsModalBack.addEventListener(
        "click",
        function () {

            rawNutsModal.classList.remove("active");

            document.body.style.overflow = "";

        }
    );

}

/* =========================================================
   ROASTED NUTS MODAL
========================================================= */

const roastedNutsModal =
    document.getElementById("roastedNutsModal");

const roastedNutsModalBack =
    document.getElementById("roastedNutsModalBack");

const roastedNutsButton =
    document.querySelector(
        '.category-card[data-category="roasted-nuts"]'
    );


/* فتح مودال المكسرات المحمصة */

if (roastedNutsButton && roastedNutsModal) {

    roastedNutsButton.addEventListener(
        "click",
        function () {

            roastedNutsModal.classList.add("active");

            document.body.style.overflow =
                "hidden";

        }
    );

}


/* إغلاق المودال */

if (roastedNutsModalBack && roastedNutsModal) {

    roastedNutsModalBack.addEventListener(
        "click",
        function () {

            roastedNutsModal.classList.remove("active");

            document.body.style.overflow = "";

        }
    );

}


/* =========================================================
   MIXED ROASTED NUTS MODAL
========================================================= */

const mixedRoastedNutsModal =
    document.getElementById("mixedRoastedNutsModal");

const mixedRoastedNutsModalBack =
    document.getElementById("mixedRoastedNutsModalBack");

const mixedRoastedNutsButton =
    document.querySelector(
        '.category-card[data-category="mixed-roasted-nuts"]'
    );


/* فتح مودال مكسرات محمصة ميكس */

if (mixedRoastedNutsButton && mixedRoastedNutsModal) {

    mixedRoastedNutsButton.addEventListener(
        "click",
        function () {

            mixedRoastedNutsModal.classList.add("active");

            document.body.style.overflow = "hidden";

        }
    );

}


/* إغلاق المودال */

if (mixedRoastedNutsModalBack && mixedRoastedNutsModal) {

    mixedRoastedNutsModalBack.addEventListener(
        "click",
        function () {

            mixedRoastedNutsModal.classList.remove("active");

            document.body.style.overflow = "";

        }
    );

}

/* =========================================================
   DRIED FRUITS MODAL
========================================================= */

const driedFruitsModal =
    document.getElementById("driedFruitsModal");

const driedFruitsModalBack =
    document.getElementById("driedFruitsModalBack");

const driedFruitsButton =
    document.querySelector(
        '.category-card[data-category="dried-fruits"]'
    );


/* فتح مودال الفواكه المجففة */

if (driedFruitsButton && driedFruitsModal) {

    driedFruitsButton.addEventListener(
        "click",
        function () {

            driedFruitsModal.classList.add("active");

            document.body.style.overflow = "hidden";

        }
    );

}


/* إغلاق المودال */

if (driedFruitsModalBack && driedFruitsModal) {

    driedFruitsModalBack.addEventListener(
        "click",
        function () {

            driedFruitsModal.classList.remove("active");

            document.body.style.overflow = "";

        }
    );

}

/* =========================================================
   SPICES MODAL
========================================================= */

const spicesModal =
    document.getElementById("spicesModal");

const spicesModalBack =
    document.getElementById("spicesModalBack");

const spicesButton =
    document.querySelector(
        '.category-card[data-category="spices"]'
    );


/* فتح مودال البهارات */

if (spicesButton && spicesModal) {

    spicesButton.addEventListener(
        "click",
        function () {

            spicesModal.classList.add("active");

            document.body.style.overflow = "hidden";

        }
    );

}


/* إغلاق المودال */

if (spicesModalBack && spicesModal) {

    spicesModalBack.addEventListener(
        "click",
        function () {

            spicesModal.classList.remove("active");

            document.body.style.overflow = "";

        }
    );

}

/* =========================================================
   CLOSE PRODUCT OPTIONS MODAL
========================================================= */

const productOptionsBack =
    document.getElementById("productOptionsBack");

const productOptionsOverlay =
    document.getElementById("productOptionsOverlay");


function closeProductOptionsModal() {

    const modal =
        document.getElementById("productOptionsModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";


    // إذا كان مودال القسم ما زال مفتوحاً
    // نبقي منع السكرول
    const openedCategory =
        document.querySelector(".category-modal.active");

    if (openedCategory) {

        document.body.style.overflow = "hidden";

    } else {

        document.body.style.overflow = "";

    }
}


/* زر الرجوع */

if (productOptionsBack) {

    productOptionsBack.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeProductOptionsModal();

        }
    );

}


/* الضغط على الخلفية أيضاً يغلق المودال */

if (productOptionsOverlay) {

    productOptionsOverlay.addEventListener(
        "click",
        function () {

            closeProductOptionsModal();

        }
    );

}

/* =========================================================
   CART MODAL
========================================================= */

function setupCartModal() {

    const modal =
        document.getElementById("cartModal");

    const overlay =
        document.getElementById("cartModalOverlay");

    const closeBtn =
        document.getElementById("cartCloseBtn");

    const continueBtn =
        document.getElementById("cartContinueBtn");

    const clearBtn =
        document.getElementById("cartClearBtn");

    const checkoutBtn =
        document.getElementById("cartCheckoutBtn");

        const confirmClearBtn =
    document.getElementById(
        "confirmClearCart"
    );

const cancelClearBtn =
    document.getElementById(
        "cancelClearCart"
    );

const clearCartModal =
    document.getElementById(
        "clearCartModal"
    );

const clearCartOverlay =
    clearCartModal
        ? clearCartModal.querySelector(
            ".clear-cart-overlay"
        )
        : null;


if (confirmClearBtn) {

    confirmClearBtn.addEventListener(
        "click",
        confirmClearCart
    );

}


if (cancelClearBtn) {

    cancelClearBtn.addEventListener(
        "click",
        closeClearCartModal
    );

}


if (clearCartOverlay) {

    clearCartOverlay.addEventListener(
        "click",
        closeClearCartModal
    );

}

    if (!modal) {
        return;
    }


    /* CLOSE */

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeCartModal
        );

    }


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeCartModal
        );

    }


    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            closeCartModal
        );

    }


    /* CLEAR */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearCart
        );

    }


    /* CHECKOUT */

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            checkoutCart
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeCartModal();

            }

        }
    );


    /* ITEMS EVENTS */

    const itemsContainer =
        document.getElementById(
            "cartItemsContainer"
        );


    if (itemsContainer) {

        itemsContainer.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-cart-action]"
                    );

                if (!button) {
                    return;
                }


                const index =
                    Number(
                        button.dataset.index
                    );

                const action =
                    button.dataset.cartAction;


                if (
                    !Number.isInteger(index) ||
                    !AppState.cart[index]
                ) {
                    return;
                }


                if (action === "plus") {

                    changeCartQuantity(
                        index,
                        1
                    );

                }


                if (action === "minus") {

                    changeCartQuantity(
                        index,
                        -1
                    );

                }


                if (action === "delete") {

                    deleteCartItem(
                        index
                    );

                }

            }
        );

    }

}


/* =========================================================
   OPEN
========================================================= */

function openCartScreen() {

    const modal =
        document.getElementById(
            "cartModal"
        );

    if (!modal) {
        return;
    }


    renderCartModal();

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


/* مهم لأن openCart() الموجود عندك
   يبحث عن window.openCartScreen */

window.openCartScreen =
    openCartScreen;


/* =========================================================
   CLOSE
========================================================= */
function closeCartModal() {

    const modal =
        document.getElementById("cartModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.style.overflow = "";

    AppState.cart = [];

    saveCart();

    updateCartCount();

    renderCartModal();
}
/* =========================================================
   RENDER CART
========================================================= */

function renderCartModal() {

    const container =
        document.getElementById(
            "cartItemsContainer"
        );

    const empty =
        document.getElementById(
            "cartEmpty"
        );

    const footer =
        document.getElementById(
            "cartModalFooter"
        );

    const countText =
        document.getElementById(
            "cartItemsCount"
        );

    const footerCount =
        document.getElementById(
            "cartFooterCount"
        );

    const grandTotal =
        document.getElementById(
            "cartGrandTotal"
        );


    if (!container) {
        return;
    }


    const cart =
        Array.isArray(AppState.cart)
            ? AppState.cart
            : [];


    /* EMPTY */

    if (cart.length === 0) {

        container.innerHTML = "";

        empty.style.display =
            "block";

        footer.style.display =
            "none";

        countText.textContent =
            "0 منتجات";

        return;
    }


    empty.style.display =
        "none";

    footer.style.display =
        "block";


    /* COUNT */

    const totalQuantity =
        cart.reduce(
            function(sum, item) {

                return sum +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    countText.textContent =
        totalQuantity +
        (
            totalQuantity === 1
                ? " منتج"
                : " منتجات"
        );


    footerCount.textContent =
        totalQuantity;


    /* TOTAL */

    const total =
        cart.reduce(
            function(sum, item) {

                return sum +
                    Number(
                        item.total || 0
                    );

            },
            0
        );


    grandTotal.textContent =
        formatPrice(total);


    /* ITEMS */

    container.innerHTML =
        cart.map(
            function(item, index) {

                return createCartItemHTML(
                    item,
                    index
                );

            }
        ).join("");
}


/* =========================================================
   CREATE ITEM
========================================================= */

function createCartItemHTML(
    item,
    index
) {

    const name =
        item.name || "منتج";


    const image =
        item.image || "";


    const quantity =
        Number(
            item.quantity || 1
        );


    const unitPrice =
        Number(
            item.unitPrice || 0
        );


    const total =
        Number(
            item.total ||
            (
                unitPrice *
                quantity
            )
        );


    const weight =
        item.weight || "";


    const grind =
        item.grind || "";


    return `

        <div class="cart-item">

            <div class="cart-item-image">

                ${
                    image
                    ?
                    `<img
                        src="${escapeCartHTML(image)}"
                        alt="${escapeCartHTML(name)}"
                    >`
                    :
                    `☕`
                }

            </div>


            <div class="cart-item-content">

                <div class="cart-item-top">

                    <h3 class="cart-item-name">
                        ${escapeCartHTML(name)}
                    </h3>


                    <button
                        type="button"
                        class="cart-item-delete"
                        data-cart-action="delete"
                        data-index="${index}">

                        🗑

                    </button>

                </div>


                <div class="cart-item-details">

                    ${
                        weight
                        ?
                        `
                        <span class="cart-detail">
                            ${escapeCartHTML(weight)}
                        </span>
                        `
                        :
                        ""
                    }


                    ${
                        grind
                        ?
                        `
                        <span class="cart-detail">
                            ${escapeCartHTML(grind)}
                        </span>
                        `
                        :
                        ""
                    }

                </div>


                <div class="cart-item-bottom">

                    <div>

                        <div class="cart-item-price">

                            ${formatPrice(total)}

                        </div>

                    </div>


                    <div class="cart-item-quantity">

                        <button
                            type="button"
                            class="cart-qty-btn"
                            data-cart-action="minus"
                            data-index="${index}">

                            −

                        </button>


                        <span
                            class="cart-qty-value">

                            ${quantity}

                        </span>


                        <button
                            type="button"
                            class="cart-qty-btn"
                            data-cart-action="plus"
                            data-index="${index}">

                            +

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;
}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeCartQuantity(
    index,
    amount
) {

    const item =
        AppState.cart[index];

    if (!item) {
        return;
    }


    let quantity =
        Number(
            item.quantity || 0
        );


    quantity += amount;


    /* أقل كمية = 1 */

    if (quantity < 1) {

        quantity = 1;

    }


    item.quantity =
        quantity;


    item.unitPrice =
        Number(
            item.unitPrice || 0
        );


    item.total =
        calculateMoney(
            item.unitPrice *
            item.quantity
        );


    saveCart();

    updateCartCount();

    renderCartModal();
}


/* =========================================================
   DELETE ITEM
========================================================= */

function deleteCartItem(index) {

    if (!AppState.cart[index]) {
        return;
    }


    AppState.cart.splice(
        index,
        1
    );


    saveCart();

    updateCartCount();

    renderCartModal();
}


/* =========================================================
   CLEAR CART
========================================================= */
/* =====================================================
   CLEAR CART CONFIRMATION
===================================================== */

function clearCart() {

    const cart =
        Array.isArray(AppState.cart)
            ? AppState.cart
            : [];


    if (cart.length === 0) {

        return;

    }


    const modal =
        document.getElementById(
            "clearCartModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "active"
    );

}


/* =====================================================
   CONFIRM CLEAR CART
===================================================== */

function confirmClearCart() {

    AppState.cart = [];

    saveCart();

    updateCartCount();

    renderCartModal();

    closeClearCartModal();

}


/* =====================================================
   CLOSE CLEAR CONFIRM
===================================================== */

function closeClearCartModal() {

    const modal =
        document.getElementById(
            "clearCartModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );

}


/* =========================================================
   CHECKOUT
========================================================= */
/* =====================================================
   LOCATION MODAL
===================================================== */

function openLocationModal() {

    const modal =
        document.getElementById(
            "locationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "active"
    );
}


function closeLocationModal() {

    const modal =
        document.getElementById(
            "locationModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );
}


/* =====================================================
   CHECKOUT
===================================================== */

function checkoutCart() {

    const cart =
        Array.isArray(AppState.cart)
            ? AppState.cart
            : [];

    if (cart.length === 0) {
        return;
    }


    /* افتح مودال الموقع */

    openLocationModal();
}


/* =====================================================
   GET LOCATION
===================================================== */

function requestCustomerLocation() {

    if (!navigator.geolocation) {

        showLocationError(
            "هذا الجهاز لا يدعم تحديد الموقع."
        );

        return;
    }


    const button =
        document.getElementById(
            "allowLocationBtn"
        );


    if (button) {

        button.textContent =
            "جاري تحديد الموقع...";

        button.classList.add(
            "location-loading"
        );
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            const mapsLink =
                "https://www.google.com/maps?q=" +
                latitude +
                "," +
                longitude;


            closeLocationModal();


            sendCartToWhatsApp(
                mapsLink
            );
        },


        function(error) {

            if (button) {

                button.textContent =
                    "السماح بالموقع";

                button.classList.remove(
                    "location-loading"
                );
            }


            if (error.code === 1) {

                showLocationError(
                    "لم يتم السماح بالوصول إلى الموقع.<br>فعّل الموقع من المتصفح ثم حاول مرة أخرى."
                );

            }

            else if (error.code === 2) {

                showLocationError(
                    "تعذر تحديد موقعك حاليًا.<br>تأكد من تشغيل خدمة الموقع وحاول مرة أخرى."
                );

            }

            else if (error.code === 3) {

                showLocationError(
                    "انتهى وقت تحديد الموقع.<br>اضغط على السماح بالموقع وحاول مرة أخرى."
                );

            }

            else {

                showLocationError(
                    "تعذر الحصول على موقعك.<br>حاول مرة أخرى."
                );
            }

        },

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0
        }

    );
}


/* =====================================================
   LOCATION ERROR
===================================================== */

function showLocationError(message) {

    const title =
        document.getElementById(
            "locationModalTitle"
        );

    const text =
        document.getElementById(
            "locationModalText"
        );


    if (title) {

        title.textContent =
            "تعذر تحديد الموقع";
    }


    if (text) {

        text.innerHTML =
            message;
    }


    openLocationModal();
}


/* =====================================================
   SEND ORDER TO WHATSAPP
===================================================== */

function sendCartToWhatsApp(
    mapsLink
) {

    const cart =
        Array.isArray(AppState.cart)
            ? AppState.cart
            : [];

    if (cart.length === 0) {
        return;
    }


    let message =
        "🛒 طلب جديد\n\n";


    cart.forEach(
        function(item, index) {

            const name =
                item.name || "منتج";


            const quantity =
                Number(
                    item.quantity || 1
                );


            const unitPrice =
                Number(
                    item.unitPrice || 0
                );


            const total =
                Number(
                    item.total ||
                    unitPrice * quantity
                );


            message +=
                `${index + 1}. ${name}\n`;


            if (item.weight) {

                message +=
                    `الوزن: ${item.weight}\n`;
            }


            if (item.grind) {

                message +=
                    `الطحنة: ${item.grind}\n`;
            }


            message +=
                `الكمية: ${quantity}\n`;


            message +=
                `السعر: ${formatPrice(unitPrice)}\n`;


            message +=
                `المجموع: ${formatPrice(total)}\n\n`;
        }
    );


    const grandTotal =
        cart.reduce(
            function(sum, item) {

                return sum +
                    Number(
                        item.total || 0
                    );
            },
            0
        );


    message +=
        `المجموع النهائي: ${formatPrice(grandTotal)}\n\n`;


    message +=
        "📍 موقع الزبون:\n";


    message +=
        mapsLink;


    const phone =
        "96171918022";


    const whatsappURL =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(message);


  window.location.href = whatsappURL;
}
       
/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeCartHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupCartModal
    );

} else {

    setupCartModal();

}

