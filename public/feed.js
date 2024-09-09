// Feed Page JavaScript
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const topics = params.getAll('topic');
    const newsFeed = document.getElementById('newsFeed');
  
    // Generate sample news articles based on selected topics
    topics.forEach(topic => {
      const article = document.createElement('div');
      article.classList.add('news-article');
      
      // Replace this with actual news-fetching logic
      article.innerHTML = `
        <img src="news-image.jpg" alt="${topic}" />
        <div class="news-content">
          <h2>News about ${topic}</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.</p>
          <a href="#" class="learn-more">Learn More</a>
        </div>
      `;
      
      newsFeed.appendChild(article);
    });
  });
  