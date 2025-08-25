document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    const currentUserId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;

    if (currentUserId) {
        fetch(`/chat/messages/${currentUserId}`)
            .then((res) => res.json())
            .then((messages) => {
                const messageItems = document.getElementById('message-items');

                messages.forEach((message) => {
                    const html = `
                    <div class='dropdown-divider'></div>
                    <a class='dropdown-item preview-item ${message.isRead ? 'readed' : ''}' data-user-id="${message.senderId}">
                        <div class='preview-thumbnail'>
                            <img src='${message.senderAvatar}' alt='${message.senderName}' class='profile-pic' />
                        </div>
                        <div class='preview-item-content d-flex align-items-start flex-column justify-content-center'>
                            <h6 class='preview-subject ellipsis mb-1 font-weight-normal'>
                                ${message.senderName || 'Người lạ'} gửi bạn: ${message.content}
                            </h6>
                            <p class='text-gray mb-0'>${message.formattedTime}</p>
                        </div>
                    </a>
                `;
                    messageItems.insertAdjacentHTML('beforeend', html);
                });
            });

        fetch(`/chat/unread/${currentUserId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.unreadCount > 0) {
                    document.getElementById('message-badge').style.display = 'inline-block';
                    document.getElementById('message-count').textContent = `${data.unreadCount} tin nhắn mới`;
                }
            });

        // Hiển thị tin nhắn khi ở thông báo
        document.getElementById('message-items').addEventListener('click', function (e) {
            const item = e.target.closest('.preview-item[data-user-id]');
            if (item) {
                const userId = item.getAttribute('data-user-id');
                window.location.href = `/chat?userId=${userId}`;
            }
        });

        // Tự động mở chat với user nếu có userId trên URL
        const urlParams = new URLSearchParams(window.location.search);
        const autoUserId = urlParams.get('userId');
        if (autoUserId) {
            setTimeout(() => {
                const userLink = document.querySelector(`.chat-user-link[data-user-id="${autoUserId}"]`);
                if (userLink) userLink.click();
            }, 500);
        }

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);

            if (currentUserId !== null && currentUserId !== undefined) {
                socket.emit('join', currentUserId);
                console.log(`User ${currentUserId} joined room`);
            } else {
                console.warn('Không xác định được user ID để join room');
            }
        });
        let unreadCount = 0;

        socket.on('receive_message', (message) => {
            console.log('Received receive_message:', message);
            const isMine = parseInt(message.senderId) === parseInt(currentUserId);
            const partnerId = isMine ? message.receiverId : message.senderId;

            const isCurrentChatOpen =
                window.CURRENT_CHAT_USER_ID && parseInt(window.CURRENT_CHAT_USER_ID) === parseInt(partnerId);

            // Nếu đang mở chat với partner
            if (isCurrentChatOpen) {
                appendMessageToChatBox({
                    senderId: message.senderId,
                    senderAvatar: message.senderAvatar,
                    senderName: message.senderName,
                    content: message.content,
                    timeFormatted: new Date(message.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                });

                // Nếu tin nhắn không phải của mình → mark read
                if (!isMine) {
                    fetch(`/chat/mark-as-read/${partnerId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUserId }),
                    }).then(() => {
                        document.getElementById('message-badge').style.display = 'none';
                        document.getElementById('message-count').textContent = `0 tin nhắn mới`;

                        const unreadBadge = document.querySelector(
                            `.chat-user-link[data-user-id="${partnerId}"] .unread-message span`,
                        );
                        if (unreadBadge) unreadBadge.textContent = '0';
                    });
                }
                return; // Không xử lý thông báo nữa
            }

            // === Nếu không mở chat với partner ===
            // Cập nhật dropdown thông báo
            if (!isMine) {
                document.getElementById('message-badge').style.display = 'inline-block';
                unreadCount++;
                document.getElementById('message-count').textContent = `${unreadCount} tin nhắn mới`;

                const messageItems = document.getElementById('message-items');
                const html = `
                    <div class='dropdown-divider'></div>
                        <a class='dropdown-item preview-item'>
                            <div class='preview-thumbnail'>
                                <img src='${message.senderAvatar}' alt='${message.senderName}' class='profile-pic' />
                            </div>
                            <div class='preview-item-content d-flex align-items-start flex-column justify-content-center'>
                                <h6 class='preview-subject ellipsis mb-1 font-weight-normal'>
                                    ${message.senderName || 'Người lạ'} gửi bạn: ${message.content}
                                </h6>
                                <p class='text-gray mb-0'>Vừa xong</p>
                            </div>
                        </a>
                    `;
                messageItems.insertAdjacentHTML('afterbegin', html);
            }
        });

        socket.on('update_sidebar_last_message', ({ userId, lastMessage }) => {
            updateSidebarLastMessage(userId, { content: lastMessage }, userId === currentUserId);
        });

        // ==================================================chat/show.hbs======================================================
        // Lấy danh sách khách hàng mới nhắn và đã nhắn
        let conversationList = [];
        fetch(`/chat/conversations/${currentUserId}`)
            .then((res) => res.json())
            .then((conversations) => {
                const carousel = document.getElementById('user-status-carousel');
                carousel.innerHTML = '';

                // Phần danh sách người nhắn bên sidebar (gần đây)
                const chatList = document.querySelector('.chat-user-list');
                chatList.innerHTML = ''; // Xoá dữ liệu cũ

                conversationList = conversations;
                conversations.forEach((convo) => {
                    const user = convo.user;
                    const lastMessage = convo.lastMessage || 'Chưa có tin nhắn';
                    const lastUpdated = convo.lastUpdated
                        ? new Date(convo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                    if (!user) return;

                    const firstLetter = user.name?.charAt(0) || 'U';

                    // === Render Carousel ===
                    const item = document.createElement('div');
                    item.className = 'item';
                    item.innerHTML = `
                        <a data-user-id="${user._id}" class="user-status-box">
                            <div class="avatar-xs mx-auto d-block chat-user-img ${user ? 'online' : ''}">
                                ${
                                    user.avatar
                                        ? `<img src="${user.avatar}" alt="user-img" class="img-fluid rounded-circle h-100" />`
                                        : `<span class="avatar-title rounded-circle bg-primary-subtle text-primary">
                                            ${firstLetter}
                                        </span>`
                                }
                                <span class="user-status"></span>
                            </div>
                            <h5 class="font-size-13 text-truncate mt-3 mb-1">${user.name}</h5>
                        </a>
                    `;
                    carousel.appendChild(item);

                    // === Render danh sách bên trái ===
                    const li = document.createElement('li');
                    li.className = 'unread';

                    li.innerHTML = `
                    <a data-user-id="${user._id}" class="chat-user-link">
                        <div class="d-flex">
                            <div class="chat-user-img ${user ? 'online' : ''} align-self-center me-3 ms-0">
                                ${
                                    user.avatar
                                        ? `<img src="${user.avatar}" class="rounded-circle avatar-xs" alt="">`
                                        : `<div class="avatar-xs">
                                            <span class="avatar-title rounded-circle bg-primary-subtle text-primary">
                                                ${firstLetter}
                                            </span>
                                        </div>`
                                }
                                <span class="user-status"></span>
                            </div>
                            <div class="flex-grow-1 overflow-hidden">
                                <h5 class="text-truncate font-size-15 mb-1">${user.name}</h5>
                                <p class="chat-user-message text-truncate mb-0">${lastMessage}</p>
                            </div>
                            <div class="font-size-11">${lastUpdated}</div>
                            <div class="unread-message">
                                <span class="badge badge-soft-danger rounded-pill">${convo.unreadCount}</span>
                            </div>
                        </div>
                    </a>
                `;

                    chatList.appendChild(li);
                });

                // Reinit owl carousel sau khi render xong
                $('#user-status-carousel').owlCarousel('destroy'); // clear old
                $('#user-status-carousel').owlCarousel({
                    items: 5,
                    loop: false,
                    margin: 10,
                    autoplay: false,
                    responsive: {
                        0: { items: 2 },
                        600: { items: 3 },
                        1000: { items: 5 },
                    },
                });
            });

        const userCache = {};
        const messageCache = {};

        const chatBox = document.getElementById('chat-message-list');
        const spinnerHTML = `<div id="chat-spinner" class="text-center my-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`;

        //Hiện thị tin nhắn khi click chọn khách hàng
        document.querySelector('.chat-user-list').addEventListener('click', async (e) => {
            const target = e.target.closest('.chat-user-link');
            const chatForm = document.getElementById('chat-form');

            if (!target) return;

            e.preventDefault();

            const userId = target.dataset.userId;

            window.CURRENT_CHAT_USER_ID = parseInt(userId);

            // Cập nhật userId trên URL mà không reload trang
            const url = new URL(window.location);
            url.searchParams.set('userId', userId);
            window.history.replaceState({}, '', url);

            if (chatForm) {
                chatForm.style.display = 'block';
            }

            chatBox.innerHTML = spinnerHTML;

            // Nếu đã có cache, dùng luôn
            if (userCache[userId] && messageCache[userId]) {
                renderChat(userCache[userId], messageCache[userId]);
                markAsRead(userId);
                return;
            }

            //Tìm conversationId từ conversationList
            const convo = conversationList.find((c) => c.user && String(c.user._id) === String(userId));
            window.CURRENT_CONVERSATION_ID = convo?.conversationId || null;

            try {
                const res = await fetch(`/chat/messages-with/${userId}`);
                const data = await res.json();
                userCache[userId] = data.user;
                messageCache[userId] = data.messages;
                renderChat(data.user, data.messages);
                markAsRead(userId);
            } catch (err) {
                console.error('Lỗi khi lấy tin nhắn:', err);
            }
        });

        // Gửi tin nhắn
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const content = chatInput.value.trim();
            if (!content) return;

            socket.emit('send_message', {
                senderId: currentUserId,
                receiverId: window.CURRENT_CHAT_USER_ID,
                content: content,
                conversationId: window.CURRENT_CONVERSATION_ID,
                sentAt: new Date().toISOString(),
            });

            // appendMessageToChatBox({
            //     senderId: currentUserId,
            //     content: content,
            //     receiverId: window.CURRENT_CHAT_USER_ID,
            //     senderName: CURRENT_USER_NAME,
            //     senderAvatar: CURRENT_USER_AVATAR,
            //     timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            // });

            chatInput.value = '';
            chatInput.focus();
        });

        // Hàm render chat box
        function renderChat(user, messages) {
            const chatBox = document.getElementById('chat-message-list');
            chatBox.innerHTML = '';
            const chatTitle = document.getElementById('chat-title');
            chatTitle.innerHTML = '';

            // ...render chat title như cũ...
            // ...render messages như cũ...
            messages.forEach((msg) => {
                const isMe = parseInt(msg.sender.id) === parseInt(CURRENT_USER_ID);
                const avatar = msg.sender.avatar;
                const name = msg.sender.name;
                const li = document.createElement('li');
                li.className = isMe ? 'right' : '';
                li.innerHTML = `
            <div class="conversation-list">
                <div class="chat-avatar">
                    <img src="${avatar}" alt="${name}">
                </div>
                <div class="user-chat-content">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0">${msg.content}</p>
                            <p class="chat-time mb-0">
                                <i class="ri-time-line align-middle"></i>
                                <span class="align-middle">${msg.timeFormatted}</span>
                            </p>
                        </div>
                        <div class="dropdown align-self-start">
                            <a class="dropdown-toggle show" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i class="ri-more-2-fill"></i>
                            </a>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                                <a class="dropdown-item" href="#">Save <i class="ri-save-line float-end text-muted"></i></a>
                                <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-end text-muted"></i></a>
                                <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-end text-muted"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="conversation-name">${name}</div>
                </div>
            </div>
        `;
                chatBox.appendChild(li);
            });

            // Cuộn xuống cuối
            const allMessages = document.querySelectorAll('#chat-message-list li');
            if (allMessages.length > 0) {
                allMessages[allMessages.length - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Đánh dấu đã đọc và cập nhật badge (gọi 1 lần duy nhất)
        function markAsRead(userId) {
            fetch(`/chat/mark-as-read/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: CURRENT_USER_ID }),
            }).then(() => {
                const unreadBadge = document.querySelector(
                    `.chat-user-link[data-user-id="${userId}"] .unread-message span`,
                );
                if (unreadBadge) unreadBadge.textContent = '0';
                // Ẩn badge tổng nếu không còn tin chưa đọc
                fetch(`/chat/unread/${CURRENT_USER_ID}`)
                    .then((res) => res.json())
                    .then((data) => {
                        const badge = document.getElementById('message-badge');
                        const count = document.getElementById('message-count');
                        if (data.unreadCount > 0) {
                            badge.style.display = 'inline-block';
                            count.textContent = `${data.unreadCount} tin nhắn mới`;
                        } else {
                            badge.style.display = 'none';
                            count.textContent = 'Không có tin nhắn mới';
                        }
                    });
            });
        }

        function appendMessageToChatBox({ senderId, senderAvatar, senderName, content, timeFormatted }) {
            const isMe = parseInt(senderId) === parseInt(CURRENT_USER_ID);

            const li = document.createElement('li');
            li.className = isMe ? 'right' : '';

            li.innerHTML = `
                <div class="conversation-list">
                    <div class="chat-avatar">
                        <img src="${senderAvatar}" alt="${senderName}">
                    </div>
                    <div class="user-chat-content">
                        <div class="ctext-wrap">
                            <div class="ctext-wrap-content">
                                <p class="mb-0">${content}</p>
                                <p class="chat-time mb-0">
                                    <i class="ri-time-line align-middle"></i>
                                    <span class="align-middle">${timeFormatted}</span>
                                </p>
                            </div>
                        </div>
                        <div class="conversation-name">${senderName}</div>
                    </div>
                </div>
            `;

            const chatBox = document.getElementById('chat-message-list');
            chatBox.appendChild(li);

            const allMessages = document.querySelectorAll('#chat-message-list li');
            if (allMessages.length > 0) {
                allMessages[allMessages.length - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }

        function updateSidebarLastMessage(partnerId, message, isMine) {
            const chatList = document.querySelector('.chat-user-list');
            let existingUser = document.querySelector(`.chat-user-link[data-user-id="${partnerId}"]`);

            if (existingUser) {
                // Cập nhật nội dung tin nhắn
                existingUser.querySelector('.chat-user-message').textContent = message.content;

                // Cập nhật thời gian
                const timeEl = existingUser.querySelector('.font-size-11');
                if (timeEl) timeEl.textContent = 'Vừa xong';

                // Nếu không phải mình → tăng badge
                if (!isMine) {
                    const badgeEl = existingUser.querySelector('.unread-message span');
                    if (badgeEl) badgeEl.textContent = parseInt(badgeEl.textContent || '0') + 1;
                }

                // Đưa lên đầu danh sách
                const li = existingUser.closest('li');
                if (li) chatList.insertBefore(li, chatList.firstChild);
            } else {
                // Nếu chưa có user trong sidebar → thêm mới
                const li = document.createElement('li');
                if (!isMine) li.classList.add('unread');
                li.innerHTML = `
            <a data-user-id="${partnerId}" class="chat-user-link">
                <div class="d-flex">
                    <div class="chat-user-img online align-self-center me-3 ms-0">
                        <img src="${message.senderAvatar}" class="rounded-circle avatar-xs" alt="">
                        <span class="user-status"></span>
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                        <h5 class="text-truncate font-size-15 mb-1">${message.senderName}</h5>
                        <p class="chat-user-message text-truncate mb-0">${message.content}</p>
                    </div>
                    <div class="font-size-11">Vừa xong</div>
                    <div class="unread-message">
                        <span class="badge badge-soft-danger rounded-pill">${!isMine ? 1 : 0}</span>
                    </div>
                </div>
            </a>
        `;
                chatList.insertBefore(li, chatList.firstChild);
            }
        }
    }
});
