const API_KEY = "96f81d399a5a48e382020853948f62fb";

// Modified URLs to use the appropriate endpoints
const EVERYTHING_URL = "https://newsapi.org/v2/everything";
const TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines";

window.addEventListener("load", () => fetchNews("trending"));

async function fetchNews(query) {
    try {
        let apiUrl;
        const params = new URLSearchParams();
        
        // Add API key to all requests
        params.append("apiKey", API_KEY);
        
        // Handle special categories vs general search
        if (query === "trending") {
            // For trending, use top headlines with no specific query
            apiUrl = TOP_HEADLINES_URL;
            params.append("language", "en");
            params.append("pageSize", "20");
        } else if (["technology", "science", "entertainment"].includes(query)) {
            // For categories, use top headlines with category parameter
            apiUrl = TOP_HEADLINES_URL;
            params.append("category", query);
            params.append("language", "en");
            params.append("pageSize", "20");
        } else {
            // For everything else, use the everything endpoint with query
            apiUrl = EVERYTHING_URL;
            params.append("q", query);
            params.append("language", "en");
            params.append("sortBy", "publishedAt");
            params.append("pageSize", "20");
        }
        
        const res = await fetch(`${apiUrl}?${params.toString()}`);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`API Error: ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await res.json();
        
        if (data.status === "error") {
            throw new Error(data.message || "Unknown API error");
        }
        
        bindData(data.articles);
    } catch (error) {
        console.error("Fetch error:", error);
        showErrorMessage(`Failed to load news: ${error.message}`);
    }
}

function showErrorMessage(message) {
    const container = document.getElementById("card_container");
    container.innerHTML = `
        <div style="
            background-color: #f8d7da; 
            color: #721c24; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px auto; 
            max-width: 80%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            ${message}
        </div>`;
}

function bindData(articles) {
    const cardsContainer = document.getElementById("card_container");
    const cardTemplate = document.getElementById("template-card");
    cardsContainer.innerHTML = "";
    
    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = `
            <div style="
                background-color: #e2e3e5; 
                color: #383d41; 
                padding: 20px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px auto; 
                max-width: 80%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                No articles found. Try a different search.
            </div>`;
        return;
    }
    
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
    newsTitle.innerHTML = article.title ? truncateText(article.title, 60) : "No title available";
    newsDesc.innerHTML = article.description ? truncateText(article.description, 150) : "No description available";
    
    const date = new Date(article.publishedAt).toLocaleString("en-US", { 
        timeZone: "Asia/Jakarta",
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    newsSource.innerHTML = `${article.source?.name || "Unknown Source"} · ${date}`;
    
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
