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

    // Clear loading message
    if(loadingElement) loadingElement.style.display = 'none';

    projectsData.forEach(project => {
        const projectCard = document.createElement('article');
        projectCard.className = 'project-card';

        // 1. Generate Tags HTML
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // 2. Generate Papers HTML (New Logic)
        let papersHTML = '';
        if (project.papers && project.papers.length > 0) {
            const paperLinks = project.papers.map(paper => `
                <a href="${paper.url}" target="_blank" class="paper-link" title="${paper.title}">
                    <i class="fas fa-file-alt"></i> ${paper.title}
                </a>
            `).join('');

            papersHTML = `<div class="project-papers">${paperLinks}</div>`;
        }

        // 3. Build Card HTML (Removed "Read More" link)
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
    });
}