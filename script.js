const API_KEY = "96f81d399a5a48e382020853948f62fb";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("trending"));

async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("card_container");
    const cardTemplate = document.getElementById("template-card");
    cardsContainer.innerHTML = "";
    articles.forEach((article) => {
        if (!article.urlToImage) return;
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
    
    newsImg.src = article.urlToImage || "https://via.placeholder.com/400x200";
    newsTitle.innerHTML = article.title ? `${article.title.slice(0, 60)}...` : "No title available";
    newsDesc.innerHTML = article.description ? `${article.description.slice(0, 150)}...` : "No description available";
    
    const date = new Date(article.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    newsSource.innerHTML = `${article.source?.name || "Unknown Source"} · ${date}`;
    
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let selectedNav = null;
function myquery(query) {
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
    }
});

// Add event listener for Enter key on search input
searchText.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});
