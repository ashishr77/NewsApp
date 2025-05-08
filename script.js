const API_KEY = "pub_85783cfc89c43a5e47d59648131ad965ee251";
const url = "https://newsdata.io/api/1/news?apikey=";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

window.addEventListener("load", () => fetchNews("Trending"));

async function fetchNews(query) {
    if (!query || typeof query !== "string" || query.trim() === "") {
        console.error("Invalid or empty query");
        document.getElementById("card_container").innerHTML = `<p style="color: #555; text-align: center;">Please enter a valid search term.</p>`;
        return;
    }

    try {
        const res = await fetch(`${url}${API_KEY}&q=${encodeURIComponent(query.trim())}&language=en`);
        if (!res.ok) {
            throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (data.status === "error") {
            throw new Error(`API Error: ${data.results.message || "Unknown error"}`);
        }
        bindData(data.results || []);
    } catch (error) {
        console.error("Fetch error:", error.message);
        document.getElementById("card_container").innerHTML = `<p style="color: red; text-align: center;">Failed to load news: ${error.message}</p>`;
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("card_container");
    const cardTemplate = document.getElementById("template-card");
    cardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = `<p style="color: #555; text-align: center;">No news articles found for this query.</p>`;
        return;
    }

    articles.forEach((article) => {
        if (!article.image_url || !article.title) return; // Skip articles without image or title
        const cardClone = document.importNode(cardTemplate.content, true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    // Use article.image_url if available and valid, otherwise use fixed fallback image
    newsImg.src = (article.image_url && article.image_url.startsWith("http")) ? article.image_url : FALLBACK_IMAGE;
    newsImg.alt = article.title || "News Image";
    newsTitle.innerHTML = article.title ? `${article.title.slice(0, 60)}...` : "No title available";
    newsDesc.innerHTML = article.description ? `${article.description.slice(0, 150)}...` : "No description available";

    const date = article.pubDate ? new Date(article.pubDate).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }) : "Unknown date";
    newsSource.innerHTML = `${article.source_id || "Unknown Source"} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.link, "_blank");
    });
}

let selectedNav = null;
function myquery(query) {
    if (!query) return;
    fetchNews(query);
    const navItem = document.getElementById(query);
    if (selectedNav) {
        selectedNav.classList.remove("active");
    }
    selectedNav = navItem;
    if (selectedNav) {
        selectedNav.classList.add("active");
    }
}

const searchText = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");

searchBtn.addEventListener("click", () => {
    const text = searchText.value.trim();
    if (text) {
        fetchNews(text);
        if (selectedNav) {
            selectedNav.classList.remove("active");
            selectedNav = null;
        }
    } else {
        console.log("Search input is empty");
        document.getElementById("card_container").innerHTML = `<p style="color: #555; text-align: center;">Please enter a search term.</p>`;
    }
});

searchText.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});
