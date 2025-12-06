// Company data

const companies = [
    { name: "Amazon", color: "#FF9900" },
    { name: "Deloitte", color: "#86BC25" },
    { name: "J.P.Morgan", color: "#0F4B9C" },
    { name: "Google", color: "#4285F4" },
    { name: "Microsoft", color: "#7FBA00" },
    { name: "Apple", color: "#A2AAAD" },
    { name: "Meta", color: "#1877F2" },
    { name: "Tesla", color: "#E82127" },
    { name: "Netflix", color: "#E50914" },
    { name: "Spotify", color: "#1DB954" }
];

// Function to create company items

function createCompanyItems(containerId) {
    const container = document.getElementById(containerId);
    companies.forEach(company => {
        const companyItem = document.createElement('div');
        companyItem.className = 'company-item';
        companyItem.innerHTML = `
            <div class="company-logo" style="background-color: ${company.color}">
                ${company.name.charAt(0)}
            </div>
            <span>${company.name}</span>
        `;
        container.appendChild(companyItem);
    });
}

// Initialize scrolling companies
createCompanyItems('scrolling-companies');
createCompanyItems('scrolling-companies-clone');

// Duplicate content for seamless loop (already handled by clone element)

//-----------------------------HERO LANDING SECTION ------------------------------------

// Simple animation for feature cards on scroll

document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
        
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
            
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

});


//---------------------------------- Frequenty Asked Questions Script --------------------------------

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
            
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
                
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
                    
            // Toggle current item
            item.classList.toggle('active');
        });
    });
            
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
            
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
                
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                    
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

//------------------------------------------ Resume Examples Script ---------------------------------

const resumeExamples = [
    { id: 1, title: "Modern Professional", type: "Corporate", image: "/image/resume2.jpg" },
    { id: 2, title: "Creative Designer", type: "Creative Industry", image: "/image/resume3.webp" },
    { id: 3, title: "Executive Summary", type: "Leadership", image: "/image/resumeeg.png" },
    { id: 4, title: "Minimalist", type: "Tech Industry", image: "/image/resume4.svg" },
    { id: 5, title: "Academic CV", type: "Education", image: "/image/resume5.png" },
    { id: 6, title: "Chronological", type: "Traditional", image: "/image/resume6.webp" },
    { id: 7, title: "Functional", type: "Career Change", image: "/image/resume7.png" },
    { id: 8, title: "Combination", type: "Versatile", image: "/image/resume8.jpg" },
    { id: 9, title: "Infographic", type: "Visual", image: "/image/resume9.jpg" },
    { id: 10, title: "One-Page Resume", type: "Concise", image: "/image/resume10.png" }
];

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  // keep your resumeExamples array (or paste it here)
  // const resumeExamples = [ ... ];

  const carouselTrack = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const resumeModal = document.getElementById('resumeModal');
  const closeModal = document.getElementById('closeModal');
  const modalImage = document.getElementById('modalImage');

  if (!carouselTrack || !prevBtn || !nextBtn) {
    console.error('Missing DOM nodes: check IDs for carouselTrack / prevBtn / nextBtn');
    return;
  }

  let currentIndex = 0;
  const cardsToShow = 3;
  let cardWidth = 330; // fallback; we'll compute it after creating cards

  function initCarousel() {
    carouselTrack.innerHTML = '';

    // create cards
    resumeExamples.forEach((resume, idx) => {
      const card = document.createElement('div');
      card.className = 'resume-card';
      card.innerHTML = `
        <img src="${resume.image}" alt="${resume.title}" />
        <h3>${resume.title}</h3>
        <p>${resume.type}</p>
      `;
      // open modal on click
      card.addEventListener('click', () => {
        modalImage.src = resume.image;
        resumeModal.style.display = 'block';
      });
      carouselTrack.appendChild(card);
    });

    // compute width including margin after cards exist
    const firstCard = carouselTrack.querySelector('.resume-card');
    if (firstCard) {
      const style = window.getComputedStyle(firstCard);
      const width = firstCard.getBoundingClientRect().width;
      const marginRight = parseFloat(style.marginRight) || 0;
      cardWidth = Math.round(width + marginRight);
    }

    // ensure track has transition
    carouselTrack.style.transition = 'transform 350ms ease';
    updateCarousel();
  }

  function updateCarousel() {
    const translateX = -currentIndex * cardWidth;
    // <-- FIXED: proper transform string
    carouselTrack.style.transform = `translateX(${translateX}px)`;

    // update button disabled states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= resumeExamples.length - cardsToShow;

    // card classes: mark center and adjacent
    const cards = document.querySelectorAll('.resume-card');
    const centerIndex = currentIndex + Math.floor(cardsToShow / 2);
    cards.forEach((card, index) => {
      card.classList.remove('active', 'adjacent');
      if (index === centerIndex) card.classList.add('active');
      else if (Math.abs(index - centerIndex) === 1) card.classList.add('adjacent');
    });
  }

  // event listeners
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < resumeExamples.length - cardsToShow) {
      currentIndex++;
      updateCarousel();
    }
  });

  closeModal.addEventListener('click', () => resumeModal.style.display = 'none');
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) resumeModal.style.display = 'none';
  });

  initCarousel();
});
