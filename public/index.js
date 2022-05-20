const form = document.getElementById("new-comment-form");

form.addEventListener("submit", handleFormSubmit);

const _userId = Math.floor(Math.random() * 10000 + 1)
let newCommentAvatar = document.getElementById("new-comment-avatar")
newCommentAvatar.src = `https://robohash.org/${_userId}`
newCommentAvatar.alt = `User ${_userId}`

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

function getComments() {
  console.log(`test`)
  fetch('/api/getComments')
    .then(response => response.json())
    .then(data => {
      loadComments(data)
    })
}

// populate comments list with comment data
function loadComments(data) {
  console.log('loading comments')
  console.log(data)

  const commentsList = document.getElementById("comments-list")

  if (data.length === 0) { return commentsList.innerHTML = "<p>No Comments</p>" }

  let content = ""

  data.forEach(({ id, text, userId, instant, upvotes }) => {
    content += `<div class="comment-list">`
    content += `<img class="avatar" src="https://robohash.org/${userId}" alt="User ${userId}"/>`
    content += `<div class="comment-list-content">`
    content += `<div class="comment-list-header">`
    content += `<span class="comment-list-user">User ${userId}</span> - <span>${new Date(instant).toLocaleString()}</span>`
    content += `</div>`
    content += `<p class="comment-text">${text}</p>`
    content += `<div class="btn-upvote" id=${id} value=${userId}></div>`
    content += `<button class="btn-reply">Reply</button>`
    content += `<div class="btn-react" id=${id} value=${userId}></div>`
    content += `</div></div>`
  })

  commentsList.innerHTML = content

  const upvote_buttons = document.querySelectorAll('.btn-upvote')
  upvote_buttons.forEach((button) => {
    ReactDOM.render(<UpvoteButton id={button.id} userId={button.value} />, button);
  })  

}

const ReactButton = ({ id,userId }) => {
  const handleUpvote = () => {
    console.log(`id: ${id} userId ${userId}`)
  }
  return <button className="btn-upvote" onClick={handleUpvote}>♥</button>
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