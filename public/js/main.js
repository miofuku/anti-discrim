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
        const post = {
            name: formData.get('name') || 'Anonymous',
            title: formData.get('title'),
            content: formData.get('story'),
            tags: formData.getAll('tag'),
            userType: formData.get('userType') || 'finnish', // Provide a default value
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
            // You might want to redirect here or show a success message in the page
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to submit post. Please try again.');
        }
    }

    // Posts listing functionality
    const postsContainer = document.getElementById('postsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (postsContainer) {
        console.log('Setting up posts listing');
        fetchPosts();

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.textContent.trim(); // Use the button text as the filter
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                fetchPosts(filter);
            });
        });
    }

    // Function to fetch posts
    async function fetchPosts(filter = 'all') {
        try {
            const response = await fetch(`/api/posts?filter=${encodeURIComponent(filter)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            displayPosts(posts);
        } catch (error) {
            console.error('Error:', error);
            postsContainer.innerHTML = '<p>Error: Failed to load posts. Please try again later.</p>';
        }
    }

    // Function to display posts
    function displayPosts(posts) {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            const tagsHTML = post.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');

            postElement.innerHTML = `
                <div class="post-tags">${tagsHTML}</div>
                <h2 class="post-title">${escapeHTML(post.name || 'Anonymous')}</h2>
                <p class="post-date">${post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}</p>
                <p class="post-content">${escapeHTML(post.content || 'No content')}</p>
            `;
            postsContainer.appendChild(postElement);
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