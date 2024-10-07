document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Character count functionality
    const storyTextarea = document.getElementById('story');
    const charCountSpan = document.getElementById('charCount');

    if (storyTextarea && charCountSpan) {
        console.log('Setting up character count');
        updateCharCount();
        storyTextarea.addEventListener('input', updateCharCount);
    }

    function updateCharCount() {
        const remainingChars = 1800 - storyTextarea.value.length;
        charCountSpan.textContent = remainingChars;
        console.log('Updated char count:', remainingChars);
    }

    // Form submission
    const form = document.querySelector('form');
    if (form) {
        console.log('Setting up form submission');
        form.addEventListener('submit', createPost);
    }

    // Function to create a new post
    async function createPost(event) {
        console.log('Create post function called');
        event.preventDefault();

        const formData = new FormData(form);
        const story = formData.get('story');
        const title = generateTitle(story);

        const post = {
            name: formData.get('name') || 'Anonymous',
            title: title,
            content: story,
            type: 'general', // You might want to adjust this based on your needs
            tags: formData.getAll('tag'),
            userType: formData.get('userType'),
            backgrounds: JSON.parse(formData.get('background[]') || '[]')
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

            const data = await response.json();

            if (response.ok) {
                console.log('Post created successfully');
                alert('Post Submitted Successfully!\nThank you for sharing your story with us.');
                form.reset();
                // You might want to redirect here or show a success message in the page
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to submit post. Please try again.');
        }
    }

    // Posts listing functionality
    const postsContainer = document.getElementById('postsContainer');
    const filterType = document.getElementById('filterType');

    if (postsContainer) {
        console.log('Setting up posts listing');
        fetchPosts();

        if (filterType) {
            filterType.addEventListener('change', function() {
                fetchPosts(this.value);
            });
        }
    }

    // Function to fetch posts
    async function fetchPosts(filter = 'all') {
        try {
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            displayPosts(posts, filter);
        } catch (error) {
            console.error('Error:', error);
            postsContainer.innerHTML = '<p>Error: Failed to load posts. Please try again later.</p>';
        }
    }

    // Function to display posts
    function displayPosts(posts, filter) {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            if (filter === 'all' || (post.tags && post.tags.includes(filter))) {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h2>${escapeHTML(post.title || 'Untitled')}</h2>
                    <p>${escapeHTML(post.content || 'No content')}</p>
                    <p>By: ${escapeHTML(post.name || 'Anonymous')}</p>
                    <p>Tags: ${(post.tags || []).map(escapeHTML).join(', ') || 'No tags'}</p>
                    <p>Posted on: ${post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Unknown date'}</p>
                `;
                postsContainer.appendChild(postElement);
            }
        });
    }

    // Function to escape HTML to prevent XSS
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