document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Character count functionality
    const storyTextarea = document.getElementById('story');
    const charCountSpan = document.getElementById('charCount');
    const form = document.querySelector('#share-form form');
    const postsContainer = document.getElementById('postsContainer');
    const selectedTagsContainer = document.getElementById('selectedTags');
    const availableTagsContainer = document.getElementById('availableTags');
    const clearFiltersButton = document.getElementById('clearFilters');
    const langSelect = document.getElementById('langSelect');

    const selectedTags = new Set();

    if (langSelect) {
        langSelect.addEventListener('change', (event) => {
          var lang = this.value;
          document.cookie = 'lang=' + lang + ';path=/';
          window.location.reload();
        });
    }

    // Set up event listeners
    if (storyTextarea && charCountSpan) {
        console.log('Setting up character count');
        updateCharCount();
        storyTextarea.addEventListener('input', updateCharCount);
    }

    if (form) {
        console.log('Setting up form submission');
        form.addEventListener('submit', createPost);
    }

    if (availableTagsContainer) {
        availableTagsContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('filter-btn')) {
                const tag = event.target.dataset.tag;
                toggleTag(tag);
            }
        });
    }

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', clearFilters);
    }

    if (selectedTagsContainer) {
        selectedTagsContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-tag')) {
                const tag = event.target.dataset.tag;
                selectedTags.delete(tag);
                updateSelectedTags();
                fetchPosts();
            }
        });
    }

    // If we're on the posts page, fetch posts immediately
    if (postsContainer) {
        console.log('Setting up posts listing');
        fetchPosts();
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
            userType: formData.get('userType') || 'finnish',
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
            // Optionally, scroll back to the top of the page or to the intro section
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
        fetchPosts();
    }

    function updateSelectedTags() {
        selectedTagsContainer.innerHTML = Array.from(selectedTags).map(tag =>
            `<span class="selected-tag">${escapeHTML(tag)} <button class="remove-tag" data-tag="${escapeHTML(tag)}">×</button></span>`
        ).join('');
    }

    function clearFilters() {
        selectedTags.clear();
        updateSelectedTags();
        fetchPosts();
    }

    async function fetchPosts() {
        try {
            const tagsParam = Array.from(selectedTags).join(',');
            const response = await fetch(`/api/posts?tags=${encodeURIComponent(tagsParam)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            if (!Array.isArray(posts)) {
                throw new Error('Received data is not an array');
            }
            displayPosts(posts);
        } catch (error) {
            console.error('Error:', error);
            postsContainer.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        }
    }

    function displayPosts(posts) {
        postsContainer.innerHTML = '';
        if (!Array.isArray(posts) || posts.length === 0) {
            postsContainer.innerHTML = '<p>No posts found matching the selected tags.</p>';
            return;
        }
        posts.forEach(post => {
            if (post && typeof post === 'object') {
                const postElement = document.createElement('div');
                postElement.className = 'post';

                const tagsHTML = Array.isArray(post.tags) && post.tags.length > 0
                    ? post.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')
                    : '<span class="tag">Uncategorized</span>';

                postElement.innerHTML = `
                    <div class="post-tags">${tagsHTML}</div>
                    <h2 class="post-title">${escapeHTML(post.name || 'Anonymous')}</h2>
                    <p class="post-date">${post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}</p>
                    <p class="post-content">${escapeHTML(post.content || 'No content')}</p>
                `;
                postsContainer.appendChild(postElement);
            } else {
                console.error('Invalid post data:', post);
            }
        });
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