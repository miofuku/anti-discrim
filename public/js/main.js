document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Common elements
    const langSelect = document.getElementById('langSelect');
    const storyTextarea = document.getElementById('story');
    const charCountSpan = document.getElementById('charCount');
    const form = document.querySelector('#share-form form');

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
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'lang') {
                return value;
            }
        }
        return 'zh'; // Default to Chinese if no language cookie is found
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
    if (form) {
        console.log('Setting up form submission');
        form.addEventListener('submit', createPost);
    }

    // Posts page functionality
    if (document.body.getAttribute('data-page') === 'posts') {
        console.log('Initializing posts page functionality');

        if (availableTagsContainer) {
            availableTagsContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-btn')) {
                    toggleTag(event.target.dataset.tag);
                }
            });
        }

        if (selectedTagsContainer) {
            selectedTagsContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('remove-tag')) {
                    toggleTag(event.target.dataset.tag);
                }
            });
        }

        if (postsContainer) {
            applyFilters();
        }
    }

    function updateCharCount() {
        const remainingChars = 1800 - storyTextarea.value.length;
        charCountSpan.textContent = remainingChars;
        console.log('Updated char count:', remainingChars);
    }

    async function createPost(event) {
        console.log('Create post function called');
        event.preventDefault();

        const formData = new FormData(form);
        const post = {
            name: formData.get('name') || 'Anonymous',
            title: formData.get('title'),
            content: formData.get('story'),
            tags: formData.getAll('tag'),
            userType: formData.get('userType'),
            background: JSON.parse(formData.get('background[]') || '[]')
        };

        console.log('Post data:', post);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            const data = await response.json();
            console.log('Post created successfully');
            alert('Post Submitted Successfully!\nThank you for sharing your story with us.');
            form.reset();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to submit post. Please try again.');
        }
    }

    function toggleTag(tag) {
        if (selectedTags.has(tag)) {
            selectedTags.delete(tag);
        } else {
            selectedTags.add(tag);
        }
        updateSelectedTags();
        applyFilters();
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

    // Code for the All Posts page
    if (postsContainer) {
        // Fetch and display posts
        fetchPosts();
    }

    async function fetchPosts(tags = []) {
        const queryString = tags.length > 0 ? `?tags=${tags.join(',')}` : '';
        const response = await fetch(`/api/posts${queryString}`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return response.json();
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

    function escapeHTML(str) {
        if (str === null || str === undefined) {
            return '';
        }
        return str.toString().replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});