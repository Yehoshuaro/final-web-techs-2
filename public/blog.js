document.addEventListener('DOMContentLoaded', loadBlogs);

async function loadBlogs() {
    const res = await fetch('/blogs');
    const blogs = await res.json();
    const container = document.getElementById('blogs');
    container.innerHTML = '';

    blogs.forEach(blog => {
        const div = document.createElement('div');
        div.classList.add('blog');
        div.innerHTML = `
            <h2>${blog.title}</h2>
            <p>${blog.body}</p>
            <small>By ${blog.author}</small>
            <button onclick="deleteBlog('${blog._id}')">Delete</button>
        `;
        container.appendChild(div);
    });
}

document.getElementById('blog-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const author = document.getElementById('author').value;

    await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, author })
    });

    loadBlogs();
});

async function deleteBlog(id) {
    await fetch(`/${id}`, { method: 'DELETE' });
    loadBlogs();
}
