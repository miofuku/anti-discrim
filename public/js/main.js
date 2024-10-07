// Function to validate input
function validateInput(name, title, content, type) {
    let errors = [];

    if (name.length > 50) {
        errors.push('Name should not exceed 50 characters');
    }

    if (title.length < 3 || title.length > 100) {
        errors.push('Title should be between 3 and 100 characters');
    }

    if (content.length < 10 || content.length > 1000) {
        errors.push('Content should be between 10 and 1000 characters');
    }

    if (!['general', 'question', 'idea'].includes(type)) {
        errors.push('Type must be either general, question, or idea');
    }

    return errors;
}

// Function to create a new post
async function createPost(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const type = document.getElementById('type').value;

    const errors = validateInput(name, title, content, type);

    if (errors.length > 0) {
        alert('Validation errors:\n' + errors.join('\n'));
        return;
    }

    const post = {
        name: name || 'Anonymous',
        title,
        content,
        type
    };

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
            alert('Post submitted successfully!');
            document.getElementById('postForm').reset();
        } else {
            throw new Error(data.message || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to submit post. Please try again.');
    }
}

async function fetchPosts(filter = 'all') {
    const postsContainer = document.getElementById('postsContainer');

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
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        if (filter === 'all' || post.type === filter) {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2>${escapeHTML(post.title)}</h2>
                <p>${escapeHTML(post.content)}</p>
                <p class="post-meta">
                    By: ${escapeHTML(post.name)} |
                    Type: ${escapeHTML(post.type)} |
                    Posted on: ${new Date(post.timestamp).toLocaleString()}
                </p>
            `;
            postsContainer.appendChild(postElement);
        }
    });
}

// Function to escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('postsContainer');
    const filterType = document.getElementById('filterType');

    if (postsContainer) {
        fetchPosts();
    }

    if (filterType) {
        filterType.addEventListener('change', function() {
            fetchPosts(this.value);
        });
    }
});

// Event listeners
//document.addEventListener('DOMContentLoaded', function() {
//    const storyTextarea = document.getElementById('story');
//    const charCountSpan = document.getElementById('charCount');
//    const cookieNotice = document.querySelector('.cookie-notice');
//    const acceptCookiesBtn = document.getElementById('acceptCookies');
//    const rejectCookiesBtn = document.getElementById('rejectCookies');
//    const cookieSettingsBtn = document.getElementById('cookieSettings');
//    const form = document.querySelector('form');
//    const backgroundInput = document.getElementById('backgroundInput');
//    const countryOptions = document.getElementById('countryOptions');
//    const selectedTags = document.getElementById('selectedTags');
//    const backgroundHidden = document.getElementById('backgroundHidden');
//
//    const countries = ['Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
//
//    let selectedCountries = [];
//
//    function updateBackgroundHidden() {
//        backgroundHidden.value = JSON.stringify(selectedCountries);
//    }
//
//    function addTag(country) {
//        if (!selectedCountries.includes(country)) {
//            selectedCountries.push(country);
//            const tag = document.createElement('div');
//            tag.className = 'selected-tag';
//            tag.innerHTML = `${country} <span class="remove-tag" data-country="${country}">×</span>`;
//            selectedTags.appendChild(tag);
//            updateBackgroundHidden();
//        }
//    }
//
//    function removeTag(country) {
//        selectedCountries = selectedCountries.filter(c => c !== country);
//        const tag = selectedTags.querySelector(`[data-country="${country}"]`).parentNode;
//        selectedTags.removeChild(tag);
//        updateBackgroundHidden();
//    }
//
//    backgroundInput.addEventListener('input', function() {
//        const value = this.value.toLowerCase();
//        const filteredCountries = countries.filter(country =>
//            country.toLowerCase().includes(value)
//        );
//
//        countryOptions.innerHTML = '';
//        filteredCountries.forEach(country => {
//            const option = document.createElement('div');
//            option.className = 'tag-option';
//            option.textContent = country;
//            option.addEventListener('click', function() {
//                addTag(country);
//                backgroundInput.value = '';
//                countryOptions.style.display = 'none';
//            });
//            countryOptions.appendChild(option);
//        });
//
//        countryOptions.style.display = filteredCountries.length > 0 ? 'block' : 'none';
//    });
//
//    backgroundInput.addEventListener('focus', function() {
//        if (this.value) {
//            countryOptions.style.display = 'block';
//        }
//    });
//
//    document.addEventListener('click', function(e) {
//        if (!backgroundInput.contains(e.target) && !countryOptions.contains(e.target)) {
//            countryOptions.style.display = 'none';
//        }
//    });
//
//    selectedTags.addEventListener('click', function(e) {
//        if (e.target.classList.contains('remove-tag')) {
//            removeTag(e.target.dataset.country);
//        }
//    });
//
//    // Character count
//    storyTextarea.addEventListener('input', function() {
//        const remainingChars = 1800 - this.value.length;
//        charCountSpan.textContent = remainingChars;
//    });
//
//    // Cookie notice
//    acceptCookiesBtn.addEventListener('click', function() {
//        cookieNotice.style.display = 'none';
//        // Here you would set a cookie to remember the user's choice
//    });
//
//    rejectCookiesBtn.addEventListener('click', function() {
//        cookieNotice.style.display = 'none';
//        // Here you would ensure no non-essential cookies are set
//    });
//
//    cookieSettingsBtn.addEventListener('click', function() {
//        // Here you would open a modal or navigate to a page with detailed cookie settings
//        alert('Cookie settings functionality to be implemented');
//    });
//
//    // Form submission
//    form.addEventListener('submit', function(e) {
//        e.preventDefault();
//        // Here you would handle form submission, potentially sending data to a server
//        console.log('Form submitted');
//
//        // Accessing form data, including multiple selections
//        const formData = new FormData(form);
//        const name = formData.get('name');
//        const story = formData.get('story');
//        const tags = formData.getAll('tag');
//        const userType = formData.get('userType');
//        const backgrounds = JSON.parse(formData.get('background[]') || '[]');
//
//        console.log('Name:', name);
//        console.log('Story:', story);
//        console.log('Tags:', tags);
//        console.log('User Type:', userType);
//        console.log('Backgrounds:', backgrounds);
//
//        // Here you would typically send this data to your server
//    });
//
//    // Add event listener for the filter dropdown
//    const filterType = document.getElementById('filterType');
//    if (filterType) {
//        filterType.addEventListener('change', function() {
//            displayPosts(this.value);
//        });
//    }
//
//    // Display all posts when the page loads
//    displayPosts();
//});