function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createPostElement(post) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    
    const tagsList = post.tags.map(tag => 
        `<span class="tag">${tag.label}</span>`
    ).join('');
    
    // Create a temporary element to measure the content height
    const tempDiv = document.createElement('div');
    tempDiv.className = 'content-measure';
    tempDiv.style.cssText = 'position: absolute; visibility: hidden; white-space: pre-wrap; line-height: 1.6;';
    tempDiv.textContent = post.content;
    document.body.appendChild(tempDiv);
    
    // Calculate the number of lines
    const lineHeight = parseFloat(getComputedStyle(tempDiv).lineHeight);
    const totalHeight = tempDiv.offsetHeight;
    const lines = Math.floor(totalHeight / lineHeight);
    document.body.removeChild(tempDiv);
    
    // If more than 5 lines, fold
    const hasLongContent = lines > 5;
    const previewContent = hasLongContent 
        ? post.content.split('\n').slice(0, 5).join('\n') + '...'
        : post.content;
    
    postElement.innerHTML = `
        <div class="tags">${tagsList}</div>
        <h3>${escapeHtml(post.title)}</h3>
        <div class="post-content">
            <p class="content-preview">${escapeHtml(previewContent)}</p>
            ${hasLongContent ? `
                <p class="content-full hidden">${escapeHtml(post.content)}</p>
                <button class="read-more-btn">展开阅读</button>
            ` : ''}
        </div>
        <div class="post-meta">
            <span class="author">${escapeHtml(post.name || '匿名')}</span>
            <span class="date">${new Date(post.timestamp).toLocaleDateString()}</span>
        </div>
    `;
    
    // Add expand/collapse feature
    if (hasLongContent) {
        const readMoreBtn = postElement.querySelector('.read-more-btn');
        const preview = postElement.querySelector('.content-preview');
        const fullContent = postElement.querySelector('.content-full');
        
        readMoreBtn.addEventListener('click', () => {
            const isExpanded = preview.classList.contains('hidden');
            if (isExpanded) {
                preview.classList.remove('hidden');
                fullContent.classList.add('hidden');
                readMoreBtn.textContent = '展开阅读';
            } else {
                preview.classList.add('hidden');
                fullContent.classList.remove('hidden');
                readMoreBtn.textContent = '收起';
            }
        });
    }
    
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
    
    // Initialize language selection
    initializeLanguageSelection();
    
    // Initialize different functionalities based on page type
    if (document.getElementById('storyForm')) {
        initializeForm();
    }
    
    if (document.body.getAttribute('data-page') === 'posts') {
        // Add delay to avoid initial loading error
        setTimeout(() => {
            initializePostsPage();
        }, 100);
    }
});

function initializePostsPage() {
    console.log('Initializing posts page functionality');
    const postsContainer = document.getElementById('posts-container');
    const paginationContainer = document.querySelector('.pagination');
    
    // Reset global state
    window.currentPage = 1;
    window.selectedTags = new Set();
    window.isLoading = false;

    if (!postsContainer) {
        console.error('Posts container not found');
        return;
    }

    // Initialize tag buttons with event delegation
    const availableTagsContainer = document.getElementById('availableTags');
    if (availableTagsContainer) {
        // Remove any existing event listeners
        availableTagsContainer.removeEventListener('click', handleTagClick);
        // Add new event listener
        availableTagsContainer.addEventListener('click', handleTagClick);
    }

    // Load initial posts
    loadPosts(1);
}

async function handleTagClick(event) {
    const btn = event.target.closest('.filter-btn');
    if (!btn || window.isLoading) return;

    const tag = btn.dataset.tag;
    if (!tag) return;

    try {
        if (window.selectedTags.has(tag)) {
            window.selectedTags.delete(tag);
            btn.classList.remove('active');
        } else {
            window.selectedTags.add(tag);
            btn.classList.add('active');
        }

        // Reset to page 1 when changing filters
        window.currentPage = 1;
        await loadPosts(1);
    } catch (error) {
        console.error('Error handling tag click:', error);
        window.selectedTags.delete(tag);  // Revert tag selection on error
        btn.classList.remove('active');
    }
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    let paginationHTML = '';
    
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn prev-btn" data-page="${currentPage - 1}">上一页</button>`;
    }
    
    // Add page numbers with emphasis on current page
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn current" data-page="${i}">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
        }
    }
    
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn next-btn" data-page="${currentPage + 1}">下一页</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;

    // Add event listeners to pagination buttons
    paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.dataset.page);
            if (!isNaN(pageNum)) {
                loadPosts(pageNum);
            }
        });
    });
}

async function loadPosts(page = 1) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    // Show loading state
    postsContainer.innerHTML = '<div class="loading">加载中...</div>';

    // Add debounce/throttle to prevent too many requests
    if (window.loadingTimeout) {
        clearTimeout(window.loadingTimeout);
    }

    window.loadingTimeout = setTimeout(async () => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            
            const selectedTagsArray = Array.from(window.selectedTags);
            if (selectedTagsArray.length > 0) {
                queryParams.append('tags', selectedTagsArray.join(','));
            }

            const response = await fetch(`/api/posts?${queryParams}`);
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('请求过于频繁，请稍后再试');
                }
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            postsContainer.innerHTML = '';
            
            if (!data.posts || data.posts.length === 0) {
                postsContainer.innerHTML = '<div class="no-posts-message"><p>暂时没有相关故事</p></div>';
                document.querySelector('.pagination').innerHTML = '';
                return;
            }

            data.posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });

            updatePagination(data.currentPage, data.pages);
            window.currentPage = page;
        } catch (error) {
            console.error('Error loading posts:', error);
            postsContainer.innerHTML = `<div class="error-message">${error.message || '加载故事时出错，请稍后再试'}</div>`;
        }
    }, 300); 
}

// Move isFormInitialized declaration to top of form-related code
window.isFormInitialized = false;

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

// Function to get the current language from the cookie
function getCurrentLanguage() {
    return 'zh'; // Always return Chinese
}

// Language selection
function initializeLanguageSelection() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect) return;

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
    
    const form = event.target;
    
    // 1. First validate required fields
    const requiredFields = {
        'title': '标题',
        'story': '故事内容'
    };

    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const field = form.querySelector(`#${fieldId}`);
        if (!field || !field.value.trim()) {
            alert(`请填写${fieldName}`);
            field?.focus();
            return;
        }
    }

    // 2. Then validate tags (before user type)
    const checkboxes = document.querySelectorAll('input[name="tag"]:checked');
    const errorElement = document.getElementById('tagsError');
    if (checkboxes.length === 0) {
        errorElement.style.display = 'block';
        const tagsSection = document.getElementById('availableTags');
        tagsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    errorElement.style.display = 'none';
    
    // 3. Finally validate user type
    const userType = form.querySelector('#userType').value;
    if (!userType) {
        alert('请选择你的身份类型');
        form.querySelector('#userType')?.focus();
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const formData = new FormData(form);
        // Get hCaptcha response
        const hcaptchaResponse = formData.get('h-captcha-response');
        if (!hcaptchaResponse) {
            alert('请完成人机验证');
            return;
        }

        const post = {
            name: formData.get('name') || '匿名',
            title: formData.get('title'),
            content: formData.get('story'),
            tags: formData.getAll('tag'),
            userType: formData.get('userType'),
            background: JSON.parse(formData.get('background[]') || '[]'),
            'h-captcha-response': hcaptchaResponse
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
        // Reset hCaptcha after submission if it exists
        if (window.hcaptcha) {
            window.hcaptcha.reset();
        }
        submitButton.disabled = false;
    }
}

// Keep toggleTag for pagination compatibility
function toggleTag(tag) {
    const btn = document.querySelector(`[data-tag="${tag}"]`);
    if (!btn) return;
    
    if (window.selectedTags.has(tag)) {
        window.selectedTags.delete(tag);
        btn.classList.remove('active');
    } else {
        window.selectedTags.add(tag);
        btn.classList.add('active');
    }
    loadPosts(1);
}

// Make functions globally available
window.loadPosts = loadPosts;

// Add this function near the top of the file
function showSuccessMessage(message) {
    // Remove any existing success message
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create and show new success message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;

    // Insert the message before the form
    const form = document.getElementById('storyForm');
    if (form) {
        form.parentNode.insertBefore(messageDiv, form);
    }

    // Automatically remove the message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);

    // Scroll to the message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}