(() => {
  const init = async () => {
    await buildHTML();
    buildCSS();
    setEvents();
  };

  /**
   * Fetch products from API
   */
  const getProducts = async () => {
    try {
      const response = await fetch(
        "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json"
      );
      if (!response.ok) throw new Error("Ağ hatası: " + response.status);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      return [];
    }
  };

  const buildHTML = async () => {
    var carouselHits = ``;

    /**
     * Get products from localStorage if exists or fetch from API
     */
    if (getLocalStorage("carouselProducts") == null) {
      let products = await getProducts();

      setLocalStorage("carouselProducts", products);
      products.forEach((product) => {
        carouselHits += hitsTemplate(product);
      });
    } else {
      let products = getLocalStorage("carouselProducts");

      products.forEach((product) => {
        carouselHits += hitsTemplate(product);
      });
    }

    const html = `
      <div class="banner carousel-banner">
        <div class="container carousel-container">
          <div class="carousel-header">
            <div class="carousel-title-wrapper">
              <h2 class="carousel-title">Beğenebileceğinizi düşündüklerimiz</h2>
            </div>
          </div>
          <div class="carousel-wrapper">
            <div class="carousel-hits">${carouselHits}</div>
          </div>
          <button class="carousel-button carousel-button-prev"></button>
          <button class="carousel-button carousel-button-next"></button>
        </div>
      </div>`;

    document.querySelector(".ins-preview-wrapper").insertAdjacentHTML("afterend", html);

    becomeToCarousel({
      defaultView: 5,
      slideCount: 1,
      breakpoints: {
        991: 2,
        1279: 3,
        1479: 4,
        1480: 5,
      },
    });
  };

  /**
   * Carousel item template
   */
  const hitsTemplate = (product) => {
    let priceHTML = ``;
    const isFavorite = getLocalStorage("carouselFavorites") || [];
    const isProductFavorite = isFavorite.includes(product.id.toString());

    if (product.original_price > product.price) {
      const discountRate = (((product.original_price - product.price) / product.original_price) * 100).toFixed(0);

      priceHTML = `
        <div class="carousel-hit__price--discount">
          <span class="carousel-hit__original-price">${product.original_price} TL</span>
          <span class="carousel-hit__price-discount-rate">${Math.round(discountRate)}%
          <i class="carousel-hit__price-discount-icon icon icon-decrease"></i>
          </span>
        </div>
        <span class="carousel-hit__price carousel-hit__discounted-price">${product.price} TL</span>
      `;
    } else {
      priceHTML = `<span class="carousel-hit__price">${product.price} TL</span>`;
    }

    return `
    <div class="carousel-hit" data-product-id="${product.id}" isFavorite="${isProductFavorite}">
      <a href="${product.url}" class="carousel-hit__link" target="_blank" draggable="false">
        <figure class="carousel-hit__figure">
          <div class="carousel-hit__favorite-btn">
            <img id="carousel-hit_def-fav" ${isProductFavorite ? 'class="carousel-hit__fav-filled"' : ""} 
            src="${isProductFavorite
              ? "https://www.e-bebek.com/assets/svg/added-favorite.svg"
              : "https://www.e-bebek.com/assets/svg/default-favorite.svg"}" 
            alt="heart" class="carousel-hit__heart">
            <img id="carousel-hit__hovered-heart" src="${isProductFavorite
              ? "https://www.e-bebek.com/assets/svg/added-favorite-hover.svg"
              : "https://www.e-bebek.com/assets/svg/default-hover-favorite.svg"}" 
            alt="heart" class="carousel-hit__heart carousel-hit__hovered">
          </div>
          <img class="carousel-hit__product-image" src="${product.img}" alt="${product.name}" data-src="${product.img}" loading="lazy"/>
        </figure>
        <div class="carousel-hit__content-wrapper">
          <div class="carousel-hit__content">
            <h2 class="carousel-hit__title">
              <b>${product.brand}</b>
              <span>${product.name}</span>
            </h2>
          </div>
          <div class="carousel-hit__stars"></div>
          <div class="carousel-hit__price-container">
            ${priceHTML}
          </div>
        </div>
        <div class="carousel-hit__promo"></div>
        <div class="carousel-hit__actions">
          <div class="carousel-hit__add-to-cart">Sepete Ekle</div>
        </div>
      </a>
  </div>`;
};

  const buildCSS = () => {
    const css = `
    .carousel-banner{
      position: relative;
      margin-bottom: 50px;
    }

    .carousel-container{
        border-radius: 0 0 35px 35px;
        background-color: #fff;
        overflow: hidden;
        margin: 0 auto;
    }

    .carousel-header{
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #fef6eb;
        padding: 25px 67px;
        border-top-left-radius: 35px;
        border-top-right-radius: 35px;
        font-family: Quicksand-Bold;
        font-weight: 700;
        margin-bottom: 20px;
    }
    .carousel-title{
        font-family: Quicksand-Bold;
        font-size: 3rem;
        font-weight: 700;
        line-height: 1.11;
        color: #f28e00;
        margin: 0;
    }

    .carousel-wrapper{
      overflow: hidden;
      }
      
    .carousel-hits{
        display: flex;
        transition: transform 0.3s ease;
        user-select: none;
    }

    .carousel-hits.dragging {
      cursor: grabbing;
      transition: none !important;
    }
    .carousel-hits {
      cursor: grab;
      transition: transform 0.3s ease;
    }

    .carousel-hit{
        z-index: 1;
        display: block;
        box-sizing: border-box;
        width: 100%;
        font-family: Poppins, "cursive";
        font-size: 12px;
        padding: 5px;
        color: #7d7d7d;
        margin: 0 20px 20px 3px;
        border: 1px solid #ededed;
        border-radius: 10px;
        position: relative;
        text-decoration: none;
        background-color: #fff;
        flex: 0 0 auto;
    }
    .carousel-hit:hover{
            color: #7d7d7d;
        cursor: pointer;
        z-index: 2;
        box-shadow: 0 0 0 0 #00000030,inset 0 0 0 3px #f28e00;
    }

    .carousel-hit a{
        color: #7d7d7d;
    }

    .carousel-hit__figure{
        position: relative;
        display: block;
        width: 100%;
        background-color: #fff;
        margin-bottom: 65px;
    }

    .carousel-hit__favorite-btn {
      position: absolute;
      top:5px;
        right: 10px;
      cursor: pointer;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 0 2px 4px 0 #00000024;
      width: 50px;
      height: 50px;
    }

    .carousel-hit__favorite-btn img {
      position: absolute;
      top: 13px;
      right: 12px;
      width: 25px;
      height: 25px;
    }

    #carousel-hit__hovered-heart {
      width: 50px;
      height: 50px;
      position: absolute;
      top: 0px;
      right: 0px;
    }

    #carousel-hit_def-fav {
      display: block;
      pointer-events: none;
    }

    .carousel-hit__fav-filled{
      width: 50px !important;
      height: 50px !important;
      top: 0px !important;
      right: 0px !important;
    }

    #carousel-hit__hovered-heart {
      display: none;
      pointer-events: none;
    }

    .carousel-hit__favorite-btn:hover #carousel-hit_def-fav {
      display: none;
    }

    .carousel-hit__favorite-btn:hover #carousel-hit__hovered-heart {
      display: block;
    }

    .carousel-hit__product-image{
      max-width: 100% !important;
      width: 100%;
      max-height: 203px;
      object-fit: contain;
    }

    .carousel-hit__title{
      font-size: 1.2rem;
      height: 42px;
      overflow: hidden;
      margin-bottom: 10px;
      -webkit-line-clamp: 3;
    }

    .carousel-hit__content-wrapper{
      padding: 0 17px 17px;
    }

    .carousel-hit__stars{
    min-height:39.2px;
    }

    .carousel-hit__price-container{
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 43px;
    }

    .carousel-hit__price{
      display: block;
      width: 100%;
      font-size: 2.2rem;
      font-weight: 600;
    }

    .carousel-hit__price--discount{
      display: flex;
      align-items: center; 
    }

    .carousel-hit__original-price{
    font-size: 1.4rem;
      font-weight: 500;
      text-decoration: line-through;
    }

    .carousel-hit__price-discount-rate{
      color: #00a365;
      font-size: 18px;
      font-weight: 700;
      display: inline-flex;
      justify-content: center;
      margin-left:.5rem;
    }

    .carousel-hit__discounted-price{
      color: #00a365;
    }

    .carousel-hit__price-discount-icon{
      color: #00a365;
      display: inline-block;
      height: 22px;
      font-size: 22px;
      margin-left: 3px;
    }

    .carousel-hit__promo{
      min-height: 70px;
    }

    .carousel-hit__actions{
      padding: 0 17px 17px;
    }

    .carousel-hit__add-to-cart{
      width: 100%;
      padding: 15px 20px;
      border-radius: 37.5px;
      background-color: #fff7ec;
      color: #f28e00;
      font-family: Poppins, "cursive";
      font-size: 1.4rem;
      font-weight: 700;
      position: relative;
      text-align: center;
      z-index: 2;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
    .carousel-hit__add-to-cart:hover{
      background-color: #f28e00;
      color: #fff;
    }

    .carousel-button{
      position: absolute;
      bottom: 42.5%;
    }
    .carousel-button-prev{
      left: -50px !important;
    }
    .carousel-button-next{
      right: -50px !important;
    }

    .carousel-button{
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }

    .carousel-button-prev{
      background: url(https://cdn06.e-bebek.com/assets/svg/prev.svg) no-repeat;
      background-color: #fef6eb;
      background-position: 18px;
      left: -65px;
    }

    .carousel-button-next{
      background: url(https://cdn06.e-bebek.com/assets/svg/next.svg) no-repeat;
      background-color: #fef6eb;
      background-position: 18px;
      right: -65px;
    }

    @media (max-width: 480px) {
      .carousel-header{
        padding: 0 22px 0 10px;
        background-color: #fff;
      }
      .carousel-title{
        font-size: 2.2rem;
        line-height: 1.5;
      }
    }
`;

  const style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  };

  const setEvents = () => {
    
    /* Carousel item add to favorite button events */
    const favoriteButtons = document.querySelectorAll(
      ".carousel-hit__favorite-btn"
    );

    favoriteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const hitElement = button.closest(".carousel-hit");
        const productId = hitElement.getAttribute("data-product-id");
        const isFavorite = hitElement.getAttribute("isFavorite") === "true";
        const favorites = getLocalStorage("carouselFavorites") || [];

        const icons = {
          defaultFavImg:
            "https://www.e-bebek.com/assets/svg/default-favorite.svg",
          hoveredFavImg:
            "https://www.e-bebek.com/assets/svg/default-hover-favorite.svg",
          filledFavImg: "https://www.e-bebek.com/assets/svg/added-favorite.svg",
          hoveredFavFilledImg:
            "https://www.e-bebek.com/assets/svg/added-favorite-hover.svg",
        };

        /* Toggle favorite state */
        if (isFavorite) {
          hitElement.setAttribute("isFavorite", "false");
          hitElement.querySelector("#carousel-hit_def-fav").classList.remove("carousel-hit__fav-filled");
          hitElement.querySelector("#carousel-hit_def-fav").src = icons.defaultFavImg;
          hitElement.querySelector("#carousel-hit__hovered-heart").src = icons.hoveredFavImg;
          hitElement.querySelector("#carousel-hit__hovered-heart").classList.remove("carousel-hit__fav-filled-hover");

          const updatedFavorites = favorites.filter((id) => id !== productId);
          setLocalStorage("carouselFavorites", updatedFavorites);
        } else {
          hitElement.setAttribute("isFavorite", "true");
          hitElement.querySelector("#carousel-hit_def-fav").classList.add("carousel-hit__fav-filled");
          hitElement.querySelector("#carousel-hit_def-fav").src = icons.filledFavImg;
          hitElement.querySelector("#carousel-hit__hovered-heart").src = icons.hoveredFavFilledImg;
          hitElement.querySelector("#carousel-hit__hovered-heart").classList.add("carousel-hit__fav-filled-hover");
          
          favorites.push(productId);
          setLocalStorage("carouselFavorites", favorites);
        }
      });
    });
  };

  /* Set localStorage */
  const setLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* Get localStorage */
  const getLocalStorage = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  /* Generate carousel logic */
  const becomeToCarousel = ({
    defaultView = 4, // Default view count
    slideCount = 1, // Item per slide
    breakpoints = {}, // Responsive settings
  } = {}) => {
    const carouselContainer = document.querySelector(".carousel-container");
    if (!carouselContainer) return;

    const hitContainer = carouselContainer.querySelector(".carousel-hits");
    const hits = hitContainer.querySelectorAll(".carousel-hit");
    if (hits.length === 0) return;

    let currentIndex = 0;

    /* number of visible products */
    const showByBreakpoint = () => {
      const screenWidth = window.innerWidth;
      const sortedBreakpoints = Object.keys(breakpoints).sort((a, b) => a - b);
      for (let bp of sortedBreakpoints) {
        if (screenWidth <= bp) return breakpoints[bp];
      }
      return defaultView;
    };

    const updateCarousel = () => {
      const visibleHitCount = showByBreakpoint();
      const gapPerItem = 20;
      const containerWidth = carouselContainer.querySelector(".carousel-wrapper").offsetWidth;
      const hits = hitContainer.querySelectorAll(".carousel-hit");
      const adjustedWidth = (containerWidth - gapPerItem * (visibleHitCount - 1)) / visibleHitCount;

      hits.forEach((hit) => {
        hit.style.width = `${adjustedWidth}px`;
        hit.style.margin = `0 ${gapPerItem}px 0 0`;
      });

      const totalItemWidth = adjustedWidth + gapPerItem;
      const offset = -1 * currentIndex * totalItemWidth;

      hitContainer.style.transform = `translateX(${offset}px)`;
    };

    const lastIndex = () => {
      const visibleHitCount = showByBreakpoint();
      return Math.max(0, hits.length - visibleHitCount);
    };

    /* Button click events */
    const prevButton = carouselContainer.querySelector(".carousel-button-prev");
    const nextButton = carouselContainer.querySelector(".carousel-button-next");

    prevButton?.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - slideCount);
      updateCarousel();
    });

    nextButton?.addEventListener("click", () => {
      currentIndex = Math.min(lastIndex(), currentIndex + slideCount);
      updateCarousel();
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
    dragSupport(hitContainer);
  };

  /* Drag support */
  const dragSupport = (hitContainer) => {
    let isDragging = false;
    let beginX = 0;
    let currentDragging = 0;
    let prevDragged = 0;
    let animationFrameId;
    let hitContainerRect;

    /* Begining X position detection */
    const getBeginX = (event) => {
      const touch = event.touches ? event.touches[0] : event;
      return touch.clientX;
    };

    /* Get the starting X position */
    const dragStart = (event) => {
      isDragging = true;
      beginX = getBeginX(event) - prevDragged;
      if (!hitContainer.classList.contains("dragging")) hitContainer.classList.add("dragging");
      animationFrameId = requestAnimationFrame(animate);
      hitContainerRect = hitContainer.getBoundingClientRect();
    };

    const dragMove = (event) => {
      if (!isDragging) return;
      const currentX = getBeginX(event);
      currentDragging = currentX - beginX;
    };

    const dragEnd = () => {
      isDragging = false;
      cancelAnimationFrame(animationFrameId);
      prevDragged = currentDragging;
      hitContainer.classList.remove("dragging");

      const maxTranslate = 0;
      const minTranslate = -1 * (hitContainer.scrollWidth - hitContainerRect.width);

      if (currentDragging > maxTranslate) {
        currentDragging = maxTranslate;
        prevDragged = maxTranslate;
      }
      if (currentDragging < minTranslate) {
        currentDragging = minTranslate;
        prevDragged = minTranslate;
      }

      hitContainer.style.transform = `translateX(${currentDragging}px)`;
    };

    const animate = () => {
      hitContainer.style.transform = `translateX(${currentDragging}px)`;
      if (isDragging) animationFrameId = requestAnimationFrame(animate);
    };

    hitContainer.addEventListener("mousedown", dragStart);
    hitContainer.addEventListener("touchstart", dragStart, { passive: true });
    hitContainer.addEventListener("mousemove", dragMove);
    hitContainer.addEventListener("touchmove", dragMove, { passive: true });
    hitContainer.addEventListener("mouseup", dragEnd);
    hitContainer.addEventListener("mouseleave", dragEnd);
    hitContainer.addEventListener("touchend", dragEnd, { passive: true });
    hitContainer.addEventListener("touchcancel", dragEnd, { passive: true });
  };

  if (window.location.pathname == "/") {
    !document.querySelector(".carousel-container") ? init() : console.log("Carousel already exists");
  } else {
    console.log("wrong page");
  }
})();
