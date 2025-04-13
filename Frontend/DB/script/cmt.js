  // Dữ liệu trả về từ server (giả lập dữ liệu)

  async function getCommentsByProduct(id) {
    let data = await fetchData(`http://localhost:8000/comments/product/${id}`, "GET", null, true);
    console.log(data);
    return data;

    // document.getElementById("comment-result").innerText = JSON.stringify(data, null, 2);
  }
  // const comments = [
  //   {"id": 2, "product_id": 4, "user_id": 1, "parent_id": null, "content": "haha", "created_at": "2025-04-06 13:59:43", "username": "demo"},
  //   {"id": 3, "product_id": 4, "user_id": 1, "parent_id": 2, "content": "haha", "created_at": "2025-04-06 13:59:49", "username": "demo"},
  //   {"id": 4, "product_id": 4, "user_id": 1, "parent_id": 2, "content": "haha", "created_at": "2025-04-06 14:10:36", "username": "demo"}
  // ];
  async function init(id) {
    let comments = await getCommentsByProduct(id);
  
    // Parse nếu là string
    if (typeof comments === 'string') {
      comments = JSON.parse(comments);
    }
  
    displayComments(comments);
  }
  

  function displayComments(comments) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = ''; // Xóa hết các bình luận cũ trước khi thêm mới
  
    const parentComments = comments.filter(comment => comment.parent_id === null);
  
    parentComments.forEach(parentComment => {
      const parentCommentItem = createCommentHTML(parentComment);
      parentCommentItem.id = `comment-item-${parentComment.id}`; // Set ID duy nhất cho mỗi bình luận cha
      commentList.appendChild(parentCommentItem);
  
      // Thêm bình luận con vào phần replies của bình luận cha
      addReplies(parentCommentItem, parentComment.id, comments);
  
      // Thêm sự kiện cho nút "Phản hồi" của bình luận cha
      const replyButton = parentCommentItem.querySelector('.reply-button');
      if (replyButton) {
        replyButton.addEventListener('click', () => createReplyComment(parentComment.id, replyButton));
      }
    });
  }
  
  // Hàm thêm các bình luận con (bao gồm cả bình luận con của bình luận con)
  function addReplies(parentCommentItem, parentId, comments) {
    const repliesContainer = parentCommentItem.querySelector('.replies');
    const childComments = comments.filter(comment => comment.parent_id === parentId);
  
    childComments.forEach(childComment => {
      const childCommentItem = createCommentHTML(childComment);
      repliesContainer.appendChild(childCommentItem);
  
      // Thêm bình luận con của bình luận con (nếu có)
      addReplies(childCommentItem, childComment.id, comments);
  
      // Thêm sự kiện cho nút "Phản hồi" của bình luận con
      const childReplyButton = childCommentItem.querySelector('.reply-button');
      if (childReplyButton) {
        childReplyButton.addEventListener('click', () => createReplyComment(childComment.id, childReplyButton));
      }
    });
  }
  
  // Hàm tạo HTML cho một bình luận
  function createCommentHTML(comment) {
    const commentItem = document.createElement('div');
    commentItem.classList.add('comment-item');
    commentItem.style.display = 'flex';
    commentItem.style.marginBottom = '15px';
  
    commentItem.innerHTML = `
      <img src="https://i.pravatar.cc/40" alt="Avatar" style="border-radius: 50%; width: 40px; height: 40px; margin-right: 10px;">
      <div>
        <div style="background: #3A3B3C; padding: 10px 15px; border-radius: 18px; color: white; max-width: 400px;">
          <strong>${comment.username}</strong>
          <div>${comment.content}</div>
        </div>
        <div style="color: #b0b3b8; font-size: 13px; margin-top: 5px;">
          ${new Date(comment.created_at).toLocaleString()} · Thích · 
          <span class="reply-button" style="color: #2374e1; cursor: pointer;">Phản hồi</span>
        </div>
        <div class="replies" style="margin-left: 50px; margin-top: 10px; border-left: 2px solid #555; padding-left: 10px;">
          <!-- Các phản hồi (cmt con) sẽ được thêm vào đây -->
        </div>
        <div class="reply-box" style="display: none; margin-top: 10px;">
          <textarea placeholder="Viết bình luận..." style="width: 100%; border-radius: 15px; padding: 10px; background: #3A3B3C; color: white;"></textarea>
          <button onclick="createReplyComment(${comment.id})" style="background: #2374e1; color: white; padding: 8px 20px; border: none; border-radius: 20px; cursor: pointer; margin-top: 10px;">Đăng</button>
        </div>
      </div>
    `;
    return commentItem;
  }
  
  // Hàm tạo bình luận phản hồi
  function createReplyComment(commentId, replyButton) {
    // Kiểm tra xem đã có hộp nhập phản hồi chưa, nếu có rồi thì không tạo lại
    if (replyButton.nextElementSibling && replyButton.nextElementSibling.classList.contains('reply-input-container')) {
      return; // Nếu đã có hộp nhập, không làm gì cả
    }
  
    // Tạo hộp nhập bình luận phản hồi
    const replyInputContainer = document.createElement('div');
    replyInputContainer.classList.add('reply-input-container');
    
    replyInputContainer.innerHTML = `
      <textarea id="reply-content-${commentId}" placeholder="Viết bình luận phản hồi..." style="flex: 1; border-radius: 10px; padding: 10px 15px; border: none; resize: none; background: #3A3B3C; color: white;"></textarea>
      <button onclick="submitReplyComment(${commentId})" style="background: #2374e1; color: white; padding: 8px 20px; border: none; border-radius: 20px; cursor: pointer;">Đăng</button>
    `;
  
    replyButton.parentElement.appendChild(replyInputContainer);
  }
  
  async function submitReplyComment(parentId) {
   
    let user = JSON.parse(localStorage.getItem("user"));

    if(parentId){
       const replyContent = document.getElementById(`reply-content-${parentId}`).value;
      if (!replyContent.trim()) {
        return; // Nếu không có nội dung, không làm gì cả
      }
      const data = await fetchData("http://localhost:8000/comments", "POST", {
        product_id:  document.getElementById("comment-open").value, // Bạn có thể thay bằng giá trị đúng
        user_id: user.user_id, // Bạn có thể thay bằng giá trị đúng
        content: replyContent,
        parent_id: parentId
      }, true);
    
      // Gọi lại hàm để làm mới các bình luận sau khi gửi thành công
      openCommentPopup();

    }
    else{
      const replyContent = document.getElementById(`comment-main`).value;
      if (!replyContent.trim()) {
        return; // Nếu không có nội dung, không làm gì cả
      }
      const data = await fetchData("http://localhost:8000/comments", "POST", {
        product_id:  document.getElementById("comment-open").value, // Bạn có thể thay bằng giá trị đúng
        user_id: user.user_id, // Bạn có thể thay bằng giá trị đúng
        content: replyContent,
        parent_id: parentId
      }, true);
    
      // Gọi lại hàm để làm mới các bình luận sau khi gửi thành công
      openCommentPopup();
    }
  }
  


  // Gọi hàm để hiển thị các bình luận
//   displayComments();

async function openCommentPopup() {
    document.getElementById('comment-popup-overlay').style.display = 'block';
    document.getElementById('comment-popup').style.display = 'block';
  // Gọi hàm để hiển thị bình luận
  // displayComments();
    let id =   document.getElementById("comment-open").value;
    console.log("commet product id:"+id);
    init(id);
  }
  
  function closeCommentPopup() {
    document.getElementById('comment-popup-overlay').style.display = 'none';
    document.getElementById('comment-popup').style.display = 'none';
  }