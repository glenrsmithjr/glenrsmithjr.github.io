document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadProjects();
});

// Helper function to fetch JSON data
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// --- LOAD PROFILE & RESOURCES ---
async function loadProfile() {
    const profileData = await fetchData('data/profile.json');
    const loadingElement = document.getElementById('profile-loading');
    const contentElement = document.getElementById('sidebar-content');

    if (!profileData) {
        loadingElement.textContent = 'Failed to load profile data.';
        return;
    }

    // 1. Populate Basic Info
    document.getElementById('profile-image').src = profileData.profileImage;
    document.getElementById('profile-name').textContent = profileData.name;
    document.getElementById('profile-title').textContent = profileData.title;
    document.getElementById('profile-location').textContent = profileData.location;
    document.getElementById('profile-about').textContent = profileData.about;

    // 2. Populate Social Links
    const socialContainer = document.getElementById('social-links');
    socialContainer.innerHTML = ''; // Clear existing to prevent duplicates
    profileData.socialLinks.forEach(link => {
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.setAttribute('aria-label', link.platform);
        const icon = document.createElement('i');
        icon.className = link.icon;
        anchor.appendChild(icon);
        socialContainer.appendChild(anchor);
    });

    // 3. Populate Skills
    const skillsContainer = document.getElementById('skills-list');
    skillsContainer.innerHTML = ''; // Clear existing
    profileData.skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'tag';
        skillTag.textContent = skill;
        skillsContainer.appendChild(skillTag);
    });

    // 4. Populate Resources (Resume & Portfolio Cards)
    const resourcesGrid = document.getElementById('resources-grid');
    if (resourcesGrid && profileData.resources) {
        resourcesGrid.innerHTML = ''; // Clear existing

        profileData.resources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-card';

            card.innerHTML = `
                <div>
                    <div class="resource-header">
                        <div class="resource-icon-box">
                            <i class="${resource.icon}"></i>
                        </div>
                        <h3>${resource.title}</h3>
                    </div>
                    <p>${resource.description}</p>
                </div>
                <a href="${resource.link}" target="_blank" class="resource-link">
                    ${resource.buttonText || 'View'} <i class="fas fa-arrow-right"></i>
                </a>
            `;
            resourcesGrid.appendChild(card);
        });
    }

    // Hide loader and show sidebar content
    loadingElement.style.display = 'none';
    contentElement.style.display = 'block';
}


// --- LOAD PROJECT DATA ---
async function loadProjects() {
    const projectsData = await fetchData('data/projects.json');
    const loadingElement = document.getElementById('projects-loading');
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsData) {
        if(loadingElement) loadingElement.textContent = 'Failed to load projects.';
        return;
    }

    if(loadingElement) loadingElement.style.display = 'none';

    projectsData.forEach(project => {
        const projectCard = document.createElement('article');
        projectCard.className = 'project-card';

        // Tags HTML
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Papers HTML
        let papersHTML = '';
        if (project.papers && project.papers.length > 0) {
            const paperLinks = project.papers.map(paper => `
                <a href="${paper.url}" target="_blank" class="paper-link" title="${paper.title}">
                    <i class="fas fa-file-alt"></i> ${paper.title}
                </a>
            `).join('');
            papersHTML = `<div class="project-papers">${paperLinks}</div>`;
        }

        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-thumb">
            <div class="project-content">
                <h3>${project.title}</h3>
                <div class="tags-container project-tags">
                    ${tagsHTML}
                </div>
                <p>${project.description}</p>
                ${papersHTML}
            </div>
        `;

        projectsGrid.appendChild(projectCard);

        // --- NEW: Add Click Event for Lightbox ---
        const imgElement = projectCard.querySelector('.project-thumb');
        imgElement.addEventListener('click', () => {
            openLightbox(project.image, project.title);
        });
    });

    setupLightboxCloser();
}

// --- LIGHTBOX VARIABLES ---
let currentScale = 1;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

const modalImg = document.getElementById("lightbox-img");

// --- LIGHTBOX LOGIC ---
function openLightbox(imageSrc, captionText) {
    const modal = document.getElementById("lightbox-modal");
    const caption = document.getElementById("caption");

    modal.style.display = "block";
    modalImg.src = imageSrc;
    caption.innerHTML = captionText;

    // Reset Zoom/Pan when opening a new image
    resetZoom();
}

function resetZoom() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

function updateImageTransform() {
    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
}

function setupLightboxCloser() {
    const modal = document.getElementById("lightbox-modal");
    const span = document.getElementsByClassName("close-lightbox")[0];

    // Close on 'X' click
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close on background click
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // --- ADD ZOOM & DRAG EVENT LISTENERS ---

    // 1. Zoom with Mouse Wheel
    modalImg.addEventListener('wheel', function(e) {
        e.preventDefault(); // Prevent page scrolling

        // Determine zoom direction
        const delta = e.deltaY * -0.001;
        const newScale = currentScale + delta;

        // Restrict scale between 1x and 5x
        currentScale = Math.min(Math.max(1, newScale), 5);

        // If zoomed out completely, reset position
        if (currentScale === 1) {
            translateX = 0;
            translateY = 0;
        }

        updateImageTransform();
    });

    // 2. Start Dragging (MouseDown)
    modalImg.addEventListener('mousedown', function(e) {
        if (currentScale > 1) { // Only drag if zoomed in
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImg.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });

    // 3. Dragging (MouseMove)
    window.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        }
    });

    // 4. Stop Dragging (MouseUp)
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            modalImg.style.cursor = 'grab';
        }
    });
}