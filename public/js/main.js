let currentPage;

function createPostElement(post) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    
    const tagsList = post.tags.map(tag => 
        `<span class="tag">${tag.label}</span>`
    ).join('');
    
    postElement.innerHTML = `
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.content)}</p>
        <div class="tags">${tagsList}</div>
        <div class="post-meta">
            <span class="author">${escapeHtml(post.name || '匿名')}</span>
            <span class="date">${new Date(post.timestamp).toLocaleDateString()}</span>
        </div>
    `;
    
    return postElement;
}

function initializeForm() {
    const form = document.getElementById('storyForm');
    if (!form) return;

    // Character count functionality
    const storyTextarea = document.getElementById('story');
    const charCount = document.getElementById('charCount');
    if (storyTextarea && charCount) {
        storyTextarea.addEventListener('input', function() {
            const remaining = 1800 - this.value.length;
            charCount.textContent = remaining;
        });
    }

    // Form submission handling
    form.addEventListener('submit', createPost);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Initialize different functionalities based on page type
    if (document.getElementById('storyForm')) {
        initializeForm();
    }
    
    if (document.body.getAttribute('data-page') === 'posts') {
        initializePostsPage();
    }
});

function initializePostsPage() {
    console.log('Initializing posts page functionality');
    const postsContainer = document.getElementById('posts-container');
    const paginationContainer = document.querySelector('.pagination');

    if (!postsContainer) {
        console.error('Posts container not found');
        return;
    }

    // Load initial posts
    loadPosts(1);
}

async function loadPosts(page = 1, selectedTags = []) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        if (selectedTags.length > 0) {
            queryParams.append('tags', selectedTags.join(','));
        }

        const response = await fetch(`/api/posts?${queryParams}`);
        const data = await response.json();
        
        postsContainer.innerHTML = '';
        
        if (data.posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts-message">
                    <p>${data.message || '暂时没有故事'}</p>
                </div>`;
            return;
        }

        data.posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });

        updatePagination(data.currentPage, data.pages);
        currentPage = page;
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<div class="error-message">加载故事时出错，请稍后再试</div>';
    }
}

let isFormInitialized = false;

// Common elements
const langSelect = document.getElementById('langSelect');
const storyTextarea = document.getElementById('story');
const charCountSpan = document.getElementById('charCount');
const form = document.getElementById('storyForm');

// Posts page elements
const postsContainer = document.getElementById('postsContainer');
const selectedTagsContainer = document.getElementById('selectedTags');
const availableTagsContainer = document.getElementById('availableTags');

function initializeCountrySelection() {
    // Background in post
    const countrySearch = document.getElementById('countrySearch');
    const countryOptions = document.getElementById('countryOptions');
    const selectedCountries = document.getElementById('selectedCountries');
    const backgroundCountriesInput = document.getElementById('backgroundCountries');

    // List of countries (you may want to load this from a separate file or API)
    const countries = [
        { en: "Germany", zh: "德国" },
        { en: "China", zh: "中国" },
        { en: "Turkey", zh: "土耳其" },
        { en: "Syria", zh: "叙利亚" },
        { en: "Poland", zh: "波兰" },
        { en: "Romania", zh: "罗马尼亚" },
        { en: "Italy", zh: "意大利" },
        { en: "Greece", zh: "希腊" },
        { en: "Croatia", zh: "克罗地亚" },
        { en: "Russia", zh: "俄罗斯" },
        { en: "Ukraine", zh: "乌克兰" },
        { en: "France", zh: "法国" },
        { en: "Spain", zh: "西班牙" },
        { en: "United Kingdom", zh: "英国" },
        { en: "United States", zh: "美国" },
        { en: "Canada", zh: "加拿大" },
        { en: "Australia", zh: "澳大利亚" },
        { en: "Japan", zh: "日本" },
        { en: "South Korea", zh: "韩国" },
        { en: "India", zh: "印度" },
        { en: "Pakistan", zh: "巴基斯坦" },
        { en: "Iran", zh: "伊朗" },
        { en: "Iraq", zh: "伊拉克" },
        { en: "Afghanistan", zh: "阿富汗" },
        { en: "Vietnam", zh: "越南" },
        { en: "Philippines", zh: "菲律宾" },
        { en: "Thailand", zh: "泰国" },
        { en: "Indonesia", zh: "印度尼西亚" },
        { en: "Brazil", zh: "巴西" },
        { en: "Mexico", zh: "墨西哥" },
        { en: "Nigeria", zh: "尼日利亚" },
        { en: "Egypt", zh: "埃及" },
        { en: "Morocco", zh: "摩洛哥" },
        { en: "Tunisia", zh: "突尼斯" },
        { en: "Algeria", zh: "阿尔及利亚" }
    ];

    let selectedCountriesList = [];

    function updateCountryOptions() {
        const searchTerm = countrySearch.value.toLowerCase();
        if (searchTerm.length === 0) {
          countryOptions.style.display = 'none';
          return;
        }

        const filteredCountries = countries.filter(country =>
          (country.en.toLowerCase().includes(searchTerm) ||
           country.zh.includes(searchTerm)) &&
          !selectedCountriesList.includes(country.en)
        );

        countryOptions.innerHTML = filteredCountries.map(country =>
          `<div class="tag-option" data-en="${country.en}" data-zh="${country.zh}">${country.en} (${country.zh})</div>`
        ).join('');

        countryOptions.style.display = filteredCountries.length > 0 ? 'block' : 'none';
    }

    function updateSelectedCountries() {
        selectedCountries.innerHTML = selectedCountriesList.map(country => {
          const countryObj = countries.find(c => c.en === country);
          return `<span class="selected-tag">${country} (${countryObj.zh})<button class="remove-tag" data-country="${country}">×</button></span>`;
        }).join('');
        backgroundCountriesInput.value = JSON.stringify(selectedCountriesList);
    }

    if (countrySearch) {
        countrySearch.addEventListener('input', updateCountryOptions);
        countrySearch.addEventListener('focus', updateCountryOptions);
        countrySearch.addEventListener('blur', function() {
            // Delay hiding to allow for option selection
            setTimeout(() => countryOptions.style.display = 'none', 200);
        });
    } else {
        console.error('countrySearch not found');
    }

    if (countryOptions) {
        countryOptions.addEventListener('click', function(e) {
            if (e.target.classList.contains('tag-option')) {
              const country = e.target.dataset.en;
              if (!selectedCountriesList.includes(country)) {
                selectedCountriesList.push(country);
                updateSelectedCountries();
                countrySearch.value = '';
                updateCountryOptions();
              }
            }
        });
    } else {
        console.error('countryOptions not found');
    }

    if (selectedCountries) {
        selectedCountries.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-tag')) {
              const country = e.target.dataset.country;
              selectedCountriesList = selectedCountriesList.filter(c => c !== country);
              updateSelectedCountries();
              updateCountryOptions();
            }
        });
    } else {
        console.error('selectedCountries not found');
    }


    // Initial update
    updateCountryOptions();
}

const selectedTags = new Set();

// Function to get the current language from the cookie
function getCurrentLanguage() {
    return 'zh'; // Always return Chinese
}

// Language selection
if (langSelect) {
    const currentLang = getCurrentLanguage();
    console.log('Current language from cookie:', currentLang);

    // Update the language selector to match the current language
    langSelect.value = currentLang;

    langSelect.addEventListener('change', function(event) {
        var lang = encodeURIComponent(this.value);
        console.log('Language changed to:', lang);
        document.cookie = 'lang=' + lang + ';path=/;max-age=31536000';  // Set cookie for 1 year
        console.log('Language cookie set:', document.cookie);
        // Reload the page with the new language parameter
        window.location.href = window.location.pathname + '?lang=' + lang;
    });
}

// Character count functionality
if (storyTextarea && charCountSpan) {
    console.log('Setting up character count');
    updateCharCount();
    storyTextarea.addEventListener('input', updateCharCount);
}

// Form submission
if (form && !isFormInitialized) {
    console.log('Setting up form submission');
    form.addEventListener('submit', createPost);
    isFormInitialized = true;
}

function updateCharCount() {
    const remainingChars = 1800 - storyTextarea.value.length;
    charCountSpan.textContent = remainingChars;
    console.log('Updated char count:', remainingChars);
}

function validateTags() {
    const checkboxes = document.querySelectorAll('input[name="tag"]:checked');
    const errorElement = document.getElementById('tagsError');
    if (checkboxes.length === 0) {
        errorElement.style.display = 'block';
        return false;
    }
    errorElement.style.display = 'none';
    return true;
}

async function createPost(event) {
    event.preventDefault();
    
    // 首先验证用户类型
    const userType = form.querySelector('#userType').value;
    if (!userType) {
        alert('请选择你的身份类型');
        return;
    }
    
    // 然后验证标签
    if (!validateTags()) {
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const formData = new FormData(form);
        const post = {
            name: formData.get('name') || 'Anonymous',
            title: formData.get('title'),
            content: formData.get('story'),
            tags: formData.getAll('tag'),
            userType: formData.get('userType'),
            background: JSON.parse(formData.get('background[]') || '[]')
        };

        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(post),
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            throw new Error('服务器返回格式错误');
        }

        if (!response.ok) {
            throw new Error(data.message || '提交失败，请重试');
        }

        showSuccessMessage('提交成功！感谢分享你的故事。');
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '提交失败，请重试');
    } finally {
        submitButton.disabled = false;
    }
}

function toggleTag(tag) {
    const btn = document.querySelector(`[data-tag="${tag}"]`);
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn?.classList.remove('active');
    } else {
        selectedTags.add(tag);
        btn?.classList.add('active');
    }
    loadPosts(1, Array.from(selectedTags));
}

async function applyFilters() {
    try {
        const posts = await fetchPosts(Array.from(selectedTags));
        if (postsContainer) {
            displayPosts(posts);
        } else {
            console.warn('Posts container not found. Unable to display posts.');
        }
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

function updateSelectedTags() {
    if (selectedTagsContainer) {
        selectedTagsContainer.innerHTML = Array.from(selectedTags).map(tag => {
            const tagLabel = getTagLabel(tag);
            return `<span class="selected-tag">${escapeHTML(tagLabel)} <button class="remove-tag" data-tag="${tag}">×</button></span>`;
        }).join('');
    }
}

// Check if we're on the page with the country selection form
if (document.getElementById('countrySearch')) {
    initializeCountrySelection();
}

function displayPosts(posts) {
    if (!postsContainer) {
        console.warn('Posts container not found. Unable to display posts.');
        return;
    }

    postsContainer.innerHTML = '';
    if (!Array.isArray(posts) || posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts found matching the selected tags.</p>';
        return;
    }
    posts.forEach(post => {
        if (post && typeof post === 'object') {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            const tagsHTML = post.tags.map(tag => {
                const tagLabel = getTagLabel(tag);
                return `<span class="tag">${escapeHTML(tagLabel)}</span>`;
            }).join('');

            postElement.innerHTML = `
                <div class="post-tags">${tagsHTML}</div>
                <h2 class="post-title">${escapeHTML(post.title)}</h2>
                <p class="post-author">${escapeHTML(post.name || 'Anonymous')}</p>
                <div class="post-content">${escapeHTML(post.content)}</div>
            `;
            postsContainer.appendChild(postElement);
        } else {
            console.error('Invalid post data:', post);
        }
    });
}

function getTagLabel(tagValue) {
    if (window.tagTranslations) {
        const tagObject = window.tagTranslations.find(tag => tag.value === tagValue);
        return tagObject ? tagObject.label : tagValue;
    }
    return tagValue;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Success message
function showSuccessMessage(message) {
    // Remove any existing success messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new success message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    // Insert message after the form title
    const formTitle = document.querySelector('#share-form h2');
    if (formTitle) {
        formTitle.insertAdjacentElement('afterend', messageDiv);
        // Scroll to message position
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    let paginationHTML = '';
    
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="window.loadPosts(${currentPage - 1})">上一页</button>`;
    }
    
    paginationHTML += `<span class="page-info">第 ${currentPage} 页，共 ${totalPages} 页</span>`;
    
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="window.loadPosts(${currentPage + 1})">下一页</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

async function fetchPosts(tags = []) {
    const queryString = tags.length > 0 ? `?tags=${tags.join(',')}` : '';
    const response = await fetch(`/api/posts${queryString}`);
    if (!response.ok) {
        throw new Error('Failed to fetch posts');
    }
    return response.json();
}

// 确保 loadPosts 函数可以全局访问
window.loadPosts = loadPosts;
window.toggleTag = toggleTag;