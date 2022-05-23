// socket.io setup
var socket = io()

// userId would come from auth in a 'full' project
const _userId = Math.floor(Math.random() * 10000 + 1)
let newCommentAvatar = document.getElementById("new-comment-avatar")
newCommentAvatar.src = `https://robohash.org/${_userId}`
newCommentAvatar.alt = `User ${_userId}`

// set up submission form
const newCommentForm = document.getElementById("new-comment-form");
newCommentForm.addEventListener("submit", handleFormSubmit);

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

  console.log(fetchOptions,url)

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
    formData.append('userId', _userId)
    const responseData = await postFormDataAsJson({ url, formData });
  } catch (error) {
    console.error(error);
  }
}

// get comments from database
function getComments() {
  fetch('/api/comments')
    .then(response => response.json())
    .then(data => {
      loadComments(data)
    })
}

getComments()

// populate comments list with comment data
function loadComments(data) {

  const commentsList = document.getElementById("comments-list")

  if (data.length === 0) { return commentsList.innerHTML = "<p>No Comments</p>" }

  // rebuild comment data into parent and child arrays of comment objects
  let parentComments = []
  let childComments = []

  data.forEach(comment => {
    if (comment.replyToId === null) parentComments.push(comment)
    else (childComments.push(comment))
  })

  // map children to parents
  parentComments.forEach(comment => {
    comment.replies = []
    childComments.forEach(reply => {
      if (reply.replyToId === comment.id) {
        comment.replies.push(reply)
      }
    })
  })

  let content = ""

  parentComments.forEach(({ id, text, userId, instant, upvotes, replies }) => {

    // add parent content, buttons
    content += `
      <div class="comment-list">
        <img class="avatar" src="https://robohash.org/${userId}" alt="User ${userId}"/>
        <div class="comment-list-content">
          <div class="comment-list-header">
            <span class="comment-list-user">User ${userId}</span> - <span>${moment(instant).fromNow()}</span>
          </div>
          <p class="comment-text">${text}</p>
          <span class="btn-upvote" id=${id} value=${upvotes}></span>
          <button class="btn-reply" value=${id} onclick="toggleCommentReply(${id})">Reply</button>
            <div class="comment-reply" style="display: none;" value=${id}>
              <form class="comment-reply-form" action="/api/comments" method="POST" value=${id}>
                <textarea class="comment-reply-content" type="text" name="text" placeholder="... add a comment" rows="3" style="width: 300px;" required></textarea>
                <input class="comment-reply-button" type="submit" value="Reply" />
              </form>
            </div>
        </div>
      </div>`

    // add replies (child) content
    if (replies.length > 0) {
      replies.forEach(reply => {
        content += `
        <div class="comment-list comment-list-reply">
          <img class="avatar" src="https://robohash.org/${reply.userId}" alt="User ${reply.userId}"/>
          <div class="comment-list-content">
            <div class="comment-list-header">
              <span class="comment-list-user">User ${reply.userId}</span> - <span>${moment(reply.instant).fromNow()}</span>
            </div>
            <p class="comment-text">${reply.text}</p>
            <div class="btn-upvote" id=${reply.id} value=${reply.upvotes}></div>
          </div>
        </div>`
      })
    }

    })

  commentsList.innerHTML = content

  // add reply handler to each reply form
  const commentReplies = document.querySelectorAll(".comment-reply-form")
  commentReplies.forEach(comment => comment.addEventListener('submit', handleReply))

  // use react to render the upvote button
  const upvote_buttons = document.querySelectorAll('.btn-upvote')
  upvote_buttons.forEach((button) => {
    ReactDOM.render(<UpvoteButton id={button.id} upvotes={button.getAttribute('value')} />, button);
  })

}

function toggleCommentReply(id) {
  let div = document.querySelector(`div.comment-reply[value='${id}']`)
  if (div.style.display == 'none') div.style.display = 'block'
  else (div.style.display = 'none')
}

async function handleReply(e) {
  e.preventDefault()
  const form = e.currentTarget;
  const url = form.action;
  try {
    const formData = new FormData(form)
    console.log(formData)
    const replyToId = parseInt(form.getAttribute('value'))
    formData.append('replyToId', replyToId)
    formData.append('userId', _userId)
    const responseData = await postFormDataAsJson({ url, formData });
  } catch (error) {
    console.error(error);
  }
}

// define react upvote button component
const UpvoteButton = ({ id, upvotes }) => {

  const [upvoted, setUpvoted] = React.useState(false)
  const [upvoteCount, setUpvoteCount] = React.useState(upvotes)

  // handlers for subscription to live updates
  socket.on('upvote added', (postId) => {
    if (postId === id) {
      let newUpvoteCount = upvoteCount
      newUpvoteCount++
      setUpvoteCount(newUpvoteCount)
    }
  })

  socket.on('upvote deleted', (postId) => {
    if (postId === id) {
      let newUpvoteCount = upvoteCount
      if (newUpvoteCount > 0) newUpvoteCount--
      setUpvoteCount(newUpvoteCount)
    }
  })

  // client - server calls and state updates
  const handleUpvote = () => {
    if (!upvoted) {
      // send to server (could break here if there's an error adding and handle on client)
      addUpvote(id, _userId)
      socket.emit('upvote added', id)
      // render higher upvote count on client
      let newUpvoteCount = upvoteCount
      newUpvoteCount++
      setUpvoteCount(newUpvoteCount)
    }
    else {
      // send to server
      deleteUpvote(id, _userId)
      socket.emit('upvote deleted', id)
      // shouldn't be able to remove if at 0, but just in case...
      if (upvoteCount > 0) {
        let newUpvoteCount = upvoteCount
        newUpvoteCount--
        setUpvoteCount(newUpvoteCount)
      }
    }
    // toggle button color
    setUpvoted(!upvoted)
  }
  return (
    <button className={upvoted ? "btn-upvote btn-upvote-upvoted" : "btn-upvote"} onClick={handleUpvote} key={id}>♥ <span className="upvote-count">{upvoteCount}</span></button>
  )
}

// add upvote
function addUpvote(id, userId) {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, userId })
  };

  fetch(`/api/upvotes`, fetchOptions)
    .catch(err => console.log(err))
}

// delete upvote
function deleteUpvote(id, userId) {
  const fetchOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, userId })
  };
  fetch(`/api/upvotes`, fetchOptions)
    .catch(err => console.log(err))
}