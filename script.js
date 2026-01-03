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

// --- LOAD PROFILE DATA ---
async function loadProfile() {
    const profileData = await fetchData('data/profile.json');
    const loadingElement = document.getElementById('profile-loading');
    const contentElement = document.getElementById('sidebar-content');

    if (!profileData) {
        loadingElement.textContent = 'Failed to load profile data.';
        return;
    }

    // Populate Basic Info
    document.getElementById('profile-image').src = profileData.profileImage;
    document.getElementById('profile-name').textContent = profileData.name;
    document.getElementById('profile-title').textContent = profileData.title;
    document.getElementById('profile-location').textContent = profileData.location;
    document.getElementById('profile-about').textContent = profileData.about;

    // Populate Social Links
    const socialContainer = document.getElementById('social-links');
    profileData.socialLinks.forEach(link => {
        // If you are using FontAwesome, we create the 'i' element
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.setAttribute('aria-label', link.platform);

        const icon = document.createElement('i');
        // Assumes icon string is like "fab fa-linkedin"
        icon.className = link.icon;

        anchor.appendChild(icon);
        socialContainer.appendChild(anchor);
    });

    // Populate Skills
    const skillsContainer = document.getElementById('skills-list');
    profileData.skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'tag';
        skillTag.textContent = skill;
        skillsContainer.appendChild(skillTag);
    });

    // Set CV PDF Link
    if(profileData.cvPdfPath) {
         document.getElementById('cv-link-button').href = profileData.cvPdfPath;
    }

    // Hide loader and show content
    loadingElement.style.display = 'none';
    contentElement.style.display = 'block';
}


// --- LOAD PROJECT DATA ---
async function loadProjects() {
    const projectsData = await fetchData('data/projects.json');
    const loadingElement = document.getElementById('projects-loading');
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsData) {
        loadingElement.textContent = 'Failed to load projects.';
        return;
    }

    // Clear loading message
    loadingElement.style.display = 'none';

    projectsData.forEach(project => {
        const projectCard = document.createElement('article');
        projectCard.className = 'project-card';

        // Generate tags HTML string
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-thumb">
            <div class="project-content">
                <h3>${project.title}</h3>
                <div class="tags-container project-tags">
                    ${tagsHTML}
                </div>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank" class="read-more">
                    Read more <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        projectsGrid.appendChild(projectCard);
    });
}