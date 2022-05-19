const form = document.getElementById("new-comment-form");

form.addEventListener("submit", handleFormSubmit);

// generic helper for form POST operation handling
async function postFormDataAsJson({ url, formData }) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: formDataJsonString,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

// generic form submission handler
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const url = form.action;

  try {
    const formData = new FormData(form);
    const responseData = await postFormDataAsJson({ url, formData });
  } catch (error) {
    console.error(error);
  }
}


// load all comments on page load
document.addEventListener('DOMContentLoaded', function () {
  fetch('/api/getComments')
    .then(response => response.json())
    .then(data => {
      loadComments(data)
    })
})

// load all comments on page load
document.addEventListener('DOMContentLoaded', function () {
  fetch('/api/getComments')
    .then(response => response.json())
    .then(data => {
      loadComments(data)
    })
    .catch(err => console.log(err))
})

// populate comments list with comment data
function loadComments(data) {
  console.log('loading comments')
  console.log(data)

  const commentsList = document.getElementById("comments-list")

  if (data.length === 0) { return commentsList.innerHTML = "<p>No Comments</p>" }

  let content = ""

  data.forEach(({ id, text, userId, instant, upvotes }) => {
    content += `<div class="media">`
    content += `<div class="media-body">`
    content += `<div class="comment-list-header">`
    content += `<span class="comment-list-user">User ${userId}</span> - <span>${new Date(instant).toLocaleString()}</span>`
    content += `</div>`
    content += `<p class="comment-text">${text}</p>`
    content += `<button class="btn-upvote" onclick="handleUpvote(${id})">♥</button><span class="upvote">${upvotes} Upvotes</span>`
    content += `<button class="btn-reply">Reply</button>`
    content += `</div></div>`
  })

  commentsList.innerHTML = content

}

// add upvote
function handleUpvote(id) {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({id})
  };

  fetch(`/api/upvote`, fetchOptions)
    .catch(err => console.log(err))
}