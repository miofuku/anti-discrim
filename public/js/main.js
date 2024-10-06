// Function to create a new post
function createPost(event) {
    event.preventDefault();

    const post = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        type: document.getElementById('type').value,
        timestamp: new Date().toISOString()
    };

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));

    alert('Post submitted successfully!');// Function to create a new post
async function createPost(event) {
    event.preventDefault();

    const post = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        type: document.getElementById('type').value
    };

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });

        if (response.ok) {
            alert('Post submitted successfully!');
            document.getElementById('postForm').reset();
        } else {
            throw new Error('Failed to create post');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit post. Please try again.');
    }
}

// Function to display posts
async function displayPosts(filter = 'all') {
    const postsContainer = document.getElementById('posts');
    if (postsContainer) {
        try {
            const response = await fetch('/api/posts');
            let posts = await response.json();

            posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            postsContainer.innerHTML = '';
            posts.forEach(post => {
                if (filter === 'all' || post.type === filter) {
                    const postElement = document.createElement('div');
                    postElement.className = 'post';
                    postElement.innerHTML = `
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                        <p class="post-meta">Type: ${post.type} | Posted on: ${new Date(post.timestamp).toLocaleString()}</p>
                    `;
                    postsContainer.appendChild(postElement);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            postsContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', createPost);
    }

    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', function(e) {
            displayPosts(e.target.value);
        });
        displayPosts();
    }
});
    document.getElementById('postForm').reset();
}

// Function to display posts
function displayPosts(filter = 'all') {
    const postsContainer = document.getElementById('posts');
    if (postsContainer) {
        postsContainer.innerHTML = '';

        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        posts.forEach(post => {
            if (filter === 'all' || post.type === filter) {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p class="post-meta">Type: ${post.type} | Posted on: ${new Date(post.timestamp).toLocaleString()}</p>
                `;
                postsContainer.appendChild(postElement);
            }
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', createPost);
    }

    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', function(e) {
            displayPosts(e.target.value);
        });
        displayPosts();
    }
});